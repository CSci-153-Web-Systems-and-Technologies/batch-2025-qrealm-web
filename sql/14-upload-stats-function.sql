-- ============================================================
-- FIX: Drop existing function and recreate with correct signature
-- ============================================================

-- First, drop the existing function (if it exists)
DROP FUNCTION IF EXISTS public.get_event_upload_stats(UUID);

-- ============================================================
-- FUNCTION: get_event_upload_stats
-- ============================================================
-- Purpose: Returns comprehensive statistics about uploads for a specific event
-- Used by: upload-store.ts for analytics and quota management
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_event_upload_stats(
  p_event_id UUID
)
RETURNS TABLE (
  total BIGINT,
  approved BIGINT,
  pending BIGINT,
  rejected BIGINT,
  remaining BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_max_photos INTEGER;
BEGIN
  -- Get the event's max_photos setting
  SELECT COALESCE(max_photos, 100) INTO v_max_photos
  FROM public.events 
  WHERE id = p_event_id;
  
  -- Get counts by status
  RETURN QUERY
  WITH status_counts AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
    FROM public.uploads
    WHERE event_id = p_event_id
  )
  SELECT 
    COALESCE(sc.total_count, 0)::BIGINT,
    COALESCE(sc.approved_count, 0)::BIGINT,
    COALESCE(sc.pending_count, 0)::BIGINT,
    COALESCE(sc.rejected_count, 0)::BIGINT,
    GREATEST(v_max_photos - COALESCE(sc.total_count, 0), 0)::BIGINT as remaining_count
  FROM status_counts sc;
  
  -- If the CTE returns no rows (no uploads), return zero values
  IF NOT FOUND THEN
    total := 0;
    approved := 0;
    pending := 0;
    rejected := 0;
    remaining := v_max_photos;
    RETURN NEXT;
  END IF;
END;
$$;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT EXECUTE ON FUNCTION public.get_event_upload_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_event_upload_stats(UUID) TO anon;

-- ============================================================
-- TEST THE FUNCTION
-- ============================================================

-- Create a test event and some test uploads if needed
/*
-- Test 1: Event with no uploads
SELECT * FROM get_event_upload_stats('00000000-0000-0000-0000-000000000000');

-- Test 2: Use an actual event ID from your database
SELECT * FROM get_event_upload_stats('07e34ecd-00bc-4860-a15b-e9101655be27');
*/