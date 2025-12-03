-- ============================================
-- SUPABASE STORAGE BUCKET FOR GUEST UPLOADS
-- ============================================
-- Purpose: Create and configure storage bucket for guest photos
-- ============================================

-- Note: Storage buckets are created differently than tables.
-- Run these commands in the Supabase SQL Editor.

-- ============================================
-- STEP 2.1: ENABLE STORAGE EXTENSION (if not already)
-- ============================================

-- This is usually already enabled in Supabase
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- ============================================
-- STEP 2.2: CREATE STORAGE BUCKET (Manual Process)
-- ============================================
-- In Supabase Dashboard:
-- 1. Go to Storage → Create New Bucket
-- 2. Bucket Name: "guest-uploads"
-- 3. Public: YES (so guests can view photos)
-- 4. File Size Limit: 10485760 (10MB in bytes)
-- 5. Allowed MIME Types: image/jpeg,image/jpg,image/png,image/webp,image/gif
-- 6. Click "Create Bucket"

-- ============================================
-- STEP 2.3: SET UP STORAGE POLICIES (SQL)
-- ============================================

-- Policy 1: Anyone can view files in guest-uploads bucket
-- This makes uploaded photos publicly accessible
CREATE POLICY "Public can view guest uploads" ON storage.objects
FOR SELECT
USING (bucket_id = 'guest-uploads');

-- Policy 2: Anyone can upload files (no authentication required)
-- This allows guests to upload without creating accounts
CREATE POLICY "Anyone can upload to guest-uploads" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'guest-uploads');

-- Policy 3: Event owners can delete files from their events
-- This allows admins to clean up inappropriate content
CREATE POLICY "Event owners can delete guest uploads" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'guest-uploads'
  AND
  EXISTS (
    SELECT 1 FROM public.uploads u
    JOIN public.events e ON e.id = u.event_id
    WHERE 
      -- Extract filename from storage path
      storage.filename(name) = SPLIT_PART(u.image_url, '/', -1)
      AND e.created_by = auth.uid()
  )
);

-- ============================================
-- STEP 2.4: OPTIONAL - CREATE FOLDER STRUCTURE
-- ============================================
-- We'll create folders programmatically, but here's the concept:
-- Bucket structure: guest-uploads/{event_id}/{filename}
-- This organizes photos by event

-- ============================================
-- STEP 2.5: VERIFY STORAGE SETUP
-- ============================================

-- Check bucket exists (run in SQL Editor)
SELECT * FROM storage.buckets WHERE id = 'guest-uploads';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;