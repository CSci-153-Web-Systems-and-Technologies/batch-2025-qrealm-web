-- ============================================
-- HELPER FUNCTIONS FOR UPLOADS
-- ============================================
-- Purpose: Useful functions for common operations
-- ============================================

-- FUNCTION 1: Get upload count by status for an event
CREATE OR REPLACE FUNCTION get_event_upload_stats(event_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  pending_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
  FROM public.uploads
  WHERE uploads.event_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION 2: Check if event has reached upload limit
CREATE OR REPLACE FUNCTION check_event_upload_limit(
  p_event_id UUID,
  p_max_photos INTEGER DEFAULT 100
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current approved upload count
  SELECT COUNT(*) INTO current_count
  FROM public.uploads
  WHERE event_id = p_event_id AND status = 'approved';
  
  -- Get max photos allowed for this event
  SELECT COALESCE(e.max_photos, p_max_photos) INTO max_allowed
  FROM public.events e
  WHERE e.id = p_event_id;
  
  -- Return true if limit reached, false otherwise
  RETURN current_count >= max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION 3: Bulk update upload status
CREATE OR REPLACE FUNCTION bulk_update_upload_status(
  upload_ids UUID[],
  new_status TEXT,
  approved_by_user UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.uploads
  SET 
    status = new_status,
    approved_by = CASE 
      WHEN new_status IN ('approved', 'rejected') THEN approved_by_user 
      ELSE NULL 
    END,
    updated_at = NOW()
  WHERE id = ANY(upload_ids)
    AND status != new_status
    AND status != 'approved'; -- Prevent changing approved photos
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION 4: Clean up orphaned uploads (for admin maintenance)
CREATE OR REPLACE FUNCTION cleanup_orphaned_uploads()
RETURNS TABLE (
  deleted_count BIGINT,
  cleaned_events TEXT[]
) AS $$
DECLARE
  event_record RECORD;
  deleted_total BIGINT := 0;
  cleaned_events_array TEXT[] := '{}';
BEGIN
  -- Find events that don't exist anymore
  FOR event_record IN 
    SELECT DISTINCT u.event_id
    FROM uploads u
    LEFT JOIN events e ON e.id = u.event_id
    WHERE e.id IS NULL
    LIMIT 100 -- Safety limit
  LOOP
    -- Delete uploads for non-existent event
    DELETE FROM uploads 
    WHERE event_id = event_record.event_id
    RETURNING COUNT(*) INTO deleted_total;
    
    -- Add to cleaned events array
    cleaned_events_array := array_append(cleaned_events_array, event_record.event_id::TEXT);
  END LOOP;
  
  RETURN QUERY SELECT deleted_total, cleaned_events_array;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION 5: Get recent uploads with pagination
CREATE OR REPLACE FUNCTION get_recent_uploads(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  event_id UUID,
  image_url TEXT,
  uploaded_by TEXT,
  caption TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  event_title TEXT,
  event_organizer TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.event_id,
    u.image_url,
    u.uploaded_by,
    u.caption,
    u.status,
    u.created_at,
    e.title as event_title,
    e.organizer as event_organizer
  FROM public.uploads u
  JOIN public.events e ON e.id = u.event_id
  WHERE (p_status IS NULL OR u.status = p_status)
    AND (u.status = 'approved' OR e.created_by = auth.uid())
  ORDER BY u.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_event_upload_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_event_upload_limit(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_uploads(INTEGER, INTEGER, TEXT) TO authenticated;

-- Grant execute permissions to service role (for admin operations)
GRANT EXECUTE ON FUNCTION bulk_update_upload_status(UUID[], TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_uploads() TO service_role;

-- ============================================
-- TEST HELPER FUNCTIONS
-- ============================================

-- Test get_event_upload_stats
-- SELECT * FROM get_event_upload_stats('your-event-id-here');

-- Test check_event_upload_limit
-- SELECT check_event_upload_limit('your-event-id-here', 100);

-- Test get_recent_uploads
-- SELECT * FROM get_recent_uploads(10, 0, 'pending');