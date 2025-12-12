-- FINAL CORRECTED RLS POLICY FOR UPLOADS
-- Use UUID comparison instead of TEXT for safety and clarity

-- 1. Drop the old policy
DROP POLICY IF EXISTS upload_insert_anyone ON uploads;

-- 2. Recreate with UUID comparison (safer than text comparison)
CREATE POLICY upload_insert_anyone
ON uploads
FOR INSERT
TO public
WITH CHECK (
  -- Check 1: Status must be pending
  status = 'pending'
  -- Check 2: Event must exist and allow uploads and be active
  AND event_id IN (
    SELECT id FROM events 
    WHERE allow_photo_upload = true 
    AND is_active = true
  )
  -- Check 3: Authentication rule
  AND (
    -- CASE A: Authenticated user - uploaded_by (as UUID) MUST match auth.uid()
    (auth.uid() IS NOT NULL AND uploaded_by = (auth.uid())::text)
    OR
    -- CASE B: Anonymous/guest - uploaded_by MUST be NULL
    (auth.uid() IS NULL AND uploaded_by IS NULL)
  )
);

-- 3. Check the uploads table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'uploads'
ORDER BY ordinal_position;

-- 4. Check if there are auto-increment or default values
SELECT 
  column_name,
  is_identity,
  identity_generation,
  identity_start,
  identity_increment
FROM information_schema.columns
WHERE table_name = 'uploads' AND is_identity = 'YES';

-- 5. Check all policies
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'uploads'
ORDER BY policyname;

-- 5b. Adjust SELECT policy to allow users to read their own pending rows
-- This fixes PostgREST returning 403 after INSERT when doing .select()
DROP POLICY IF EXISTS upload_select_public_and_owners ON uploads;
CREATE POLICY upload_select_public_and_owners
ON uploads
FOR SELECT
TO public
USING (
  -- Public can see approved uploads
  status = 'approved'
  OR
  -- Event owners can see all uploads for their events
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = uploads.event_id
      AND e.created_by = auth.uid()
  )
  OR
  -- Authenticated users can see their own uploads (pending/approved/rejected)
  (auth.uid() IS NOT NULL AND uploaded_by = (auth.uid())::text)
);

-- 6. CRITICAL: Check what auth.uid() returns vs what we're storing
-- Run this to see the actual format
SELECT 
  auth.uid()::text as auth_uid_text,
  auth.uid() as auth_uid_uuid,
  gen_random_uuid()::text as sample_uuid_text;

-- 7. Test: Create a test INSERT with explicit value to verify RLS
-- This shows if the comparison logic works
INSERT INTO uploads (
  event_id,
  image_url,
  uploaded_by,
  caption,
  status,
  ip_address
) VALUES (
  '79a6e218-79b2-4563-a07d-ed16257bd506'::uuid,
  'https://example.com/test1.jpg',
  (auth.uid())::text,  -- Use auth.uid()::text directly instead of passing a value
  'Test caption',
  'pending'::text,
  '127.0.0.1'
) RETURNING *;
