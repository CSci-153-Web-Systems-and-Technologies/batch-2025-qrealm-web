-- ============================================
-- SIMPLIFIED RLS POLICIES FOR UPLOADS TABLE
-- ============================================
-- Purpose: Basic security that definitely works
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CLEAN UP ANY EXISTING POLICIES
-- ============================================
DO $$ 
BEGIN
  -- Drop all existing policies on uploads table
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS "' || policyname || '" ON public.uploads;', ' ')
    FROM pg_policies 
    WHERE tablename = 'uploads' AND schemaname = 'public'
  );
EXCEPTION
  WHEN others THEN NULL; -- Ignore errors if no policies exist
END $$;

-- ============================================
-- POLICY 1: SELECT (VIEWING)
-- ============================================
-- Public can see approved uploads
-- Event owners can see all their uploads
-- Super admins can see everything

CREATE POLICY "select_policy" ON public.uploads
FOR SELECT USING (
  -- Approved uploads are public
  status = 'approved'
  OR
  -- Event owners can see all uploads for their events
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
    AND e.created_by = auth.uid()
  )
  OR
  -- Super admins can see everything
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'super_admin'
  )
);

-- ============================================
-- POLICY 2: INSERT (CREATING)
-- ============================================
-- Anyone can create uploads, but only with pending status
-- Must be for an active event that allows uploads

CREATE POLICY "insert_policy" ON public.uploads
FOR INSERT WITH CHECK (
  -- Must be pending status
  status = 'pending'
  AND
  -- Event must exist and allow uploads
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
    AND e.allow_photo_upload = true
    AND e.is_active = true
  )
);

-- ============================================
-- POLICY 3: UPDATE (MODIFYING)
-- ============================================
-- Only event owners and super admins can update
-- Can change status to approved/rejected and update caption

CREATE POLICY "update_policy" ON public.uploads
FOR UPDATE USING (
  -- Must be event owner or super admin
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
    AND e.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'super_admin'
  )
);

-- ============================================
-- POLICY 4: DELETE (REMOVING)
-- ============================================
-- Only event owners and super admins can delete

CREATE POLICY "delete_policy" ON public.uploads
FOR DELETE USING (
  -- Must be event owner or super admin
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
    AND e.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'super_admin'
  )
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'uploads';

-- List all policies
SELECT 
  policyname,
  cmd,
  qual as condition
FROM pg_policies 
WHERE tablename = 'uploads'
ORDER BY cmd, policyname;

-- ============================================
-- TEST THE POLICIES
-- ============================================
/*
-- Test as anonymous user (no auth):
-- Should be able to INSERT pending uploads
-- Should be able to SELECT approved uploads
-- Should NOT be able to UPDATE or DELETE

-- Test as event owner:
-- Should be able to SELECT all uploads for owned events
-- Should be able to UPDATE uploads for owned events  
-- Should be able to DELETE uploads for owned events

-- Test as super admin:
-- Should be able to do everything
*/