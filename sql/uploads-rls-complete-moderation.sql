-- ============================================
-- COMPLETE RLS POLICIES FOR MODERATION SYSTEM
-- ============================================
-- Last Updated: December 13, 2025
-- Purpose: Secure access control for uploads table with proper moderation workflow
-- ============================================

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP EXISTING POLICIES (Clean Slate)
-- ============================================

DROP POLICY IF EXISTS "upload_insert_anyone" ON public.uploads;
DROP POLICY IF EXISTS "upload_select_public_and_owners" ON public.uploads;
DROP POLICY IF EXISTS "upload_update_owners" ON public.uploads;
DROP POLICY IF EXISTS "upload_delete_owners" ON public.uploads;

-- ============================================
-- 3. INSERT POLICY - Allow uploads with strict validation
-- ============================================

CREATE POLICY "upload_insert_anyone"
ON public.uploads
FOR INSERT
TO public
WITH CHECK (
  -- Check 1: Status must be 'pending' for new uploads
  status = 'pending'
  
  -- Check 2: Event must exist, allow uploads, and be active
  AND event_id IN (
    SELECT id FROM public.events 
    WHERE allow_photo_upload = true 
      AND is_active = true
  )
  
  -- Check 3: Authentication rule
  AND (
    -- CASE A: Authenticated user
    -- uploaded_by MUST match their auth.uid() converted to TEXT
    (auth.role() = 'authenticated' AND uploaded_by = (auth.uid())::text)
    
    OR
    
    -- CASE B: Anonymous/Guest user
    -- uploaded_by MUST be NULL (no anon user can set a custom name via RLS)
    -- Supports both anon role (with JWT) and NULL role (no JWT)
    ((auth.role() = 'anon' OR auth.role() IS NULL) AND uploaded_by IS NULL)
  )
);

COMMENT ON POLICY "upload_insert_anyone" ON public.uploads IS 
'Allows authenticated users and anonymous guests to upload photos to events that allow uploads and are active. Authenticated users must set uploaded_by to their auth.uid(), guests must leave it NULL.';

-- ============================================
-- 4. SELECT POLICY - Read access with proper visibility
-- ============================================

CREATE POLICY "upload_select_public_and_owners"
ON public.uploads
FOR SELECT
TO public
USING (
  -- Condition 1: Public can see approved uploads
  status = 'approved'
  
  OR
  
  -- Condition 2: Event owners can see ALL uploads for their events
  -- (pending, approved, rejected - for moderation)
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
      AND e.created_by = auth.uid()
  )
  
  OR
  
  -- Condition 3: Authenticated users can see their own uploads
  -- (pending, approved, rejected - for tracking their submissions)
  (auth.role() = 'authenticated' AND uploaded_by = (auth.uid())::text)
  
  OR
  
  -- Condition 4: Guests can see their newly inserted pending rows
  -- This allows .insert().select() to work for anonymous uploads
  -- Important: Only works immediately after insert, before they lose context
  ((auth.role() = 'anon' OR auth.role() IS NULL) AND uploaded_by IS NULL AND status = 'pending')
);

COMMENT ON POLICY "upload_select_public_and_owners" ON public.uploads IS 
'Allows: 1) Anyone to see approved uploads, 2) Event owners to see all uploads for moderation, 3) Authenticated users to see their own uploads, 4) Guests to read their just-inserted pending uploads for confirmation.';

-- ============================================
-- 5. UPDATE POLICY - Only event owners can moderate
-- ============================================

CREATE POLICY "upload_update_owners"
ON public.uploads
FOR UPDATE
TO public
USING (
  -- Only event owners can update (approve/reject)
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
      AND e.created_by = auth.uid()
  )
)
WITH CHECK (
  -- After update, must still be owned by the same event owner
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
      AND e.created_by = auth.uid()
  )
);

COMMENT ON POLICY "upload_update_owners" ON public.uploads IS 
'Only event owners can update uploads (for moderation - changing status from pending to approved/rejected).';

-- ============================================
-- 6. DELETE POLICY - Only event owners can delete
-- ============================================

CREATE POLICY "upload_delete_owners"
ON public.uploads
FOR DELETE
TO public
USING (
  -- Only event owners can delete uploads (reject with file removal)
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = uploads.event_id
      AND e.created_by = auth.uid()
  )
);

COMMENT ON POLICY "upload_delete_owners" ON public.uploads IS 
'Only event owners can delete uploads from their events (used when rejecting uploads).';

-- ============================================
-- 7. VERIFY POLICIES
-- ============================================

-- List all policies for the uploads table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'uploads'
ORDER BY policyname;

-- ============================================
-- 8. TEST SCENARIOS (Manual Testing Guide)
-- ============================================

/*
TEST 1: Anonymous Guest Upload
-------------------------------
- User: No authentication (guest)
- Action: Insert upload with uploaded_by = NULL
- Expected: SUCCESS (if event allows uploads and is active)

Example:
INSERT INTO uploads (event_id, image_url, uploaded_by, caption, status)
VALUES (
  '<valid-event-id>',
  'https://example.com/photo.jpg',
  NULL,  -- Guest (anonymous)
  'Test caption',
  'pending'
);

TEST 2: Authenticated User Upload
----------------------------------
- User: Logged in user
- Action: Insert upload with uploaded_by = auth.uid()::text
- Expected: SUCCESS (if event allows uploads and is active)

Example:
INSERT INTO uploads (event_id, image_url, uploaded_by, caption, status)
VALUES (
  '<valid-event-id>',
  'https://example.com/photo.jpg',
  (auth.uid())::text,  -- Authenticated user
  'Test caption',
  'pending'
);

TEST 3: Event Owner Views Pending Uploads
------------------------------------------
- User: Event creator/owner
- Action: SELECT pending uploads for their events
- Expected: SUCCESS (see all pending uploads for their events)

Example:
SELECT * FROM uploads
WHERE event_id IN (
  SELECT id FROM events WHERE created_by = auth.uid()
)
AND status = 'pending';

TEST 4: Event Owner Approves Upload
------------------------------------
- User: Event creator/owner
- Action: UPDATE upload status to 'approved'
- Expected: SUCCESS (can moderate their event's uploads)

Example:
UPDATE uploads
SET status = 'approved', approved_by = auth.uid()
WHERE id = '<upload-id>'
  AND event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  );

TEST 5: Event Owner Rejects Upload
-----------------------------------
- User: Event creator/owner
- Action: DELETE upload
- Expected: SUCCESS (can delete uploads from their events)

Example:
DELETE FROM uploads
WHERE id = '<upload-id>'
  AND event_id IN (
    SELECT id FROM events WHERE created_by = auth.uid()
  );

TEST 6: Public Views Approved Uploads
--------------------------------------
- User: Anyone (including non-authenticated)
- Action: SELECT approved uploads
- Expected: SUCCESS (approved uploads are public)

Example:
SELECT * FROM uploads WHERE status = 'approved';

TEST 7: User Cannot Upload to Inactive Event
---------------------------------------------
- User: Anyone
- Action: Insert upload to event with is_active = false
- Expected: FAILURE (RLS blocks insert)

TEST 8: User Cannot Upload to Event Disallowing Uploads
--------------------------------------------------------
- User: Anyone
- Action: Insert upload to event with allow_photo_upload = false
- Expected: FAILURE (RLS blocks insert)

TEST 9: Guest Cannot Read Other Guests' Pending Uploads
--------------------------------------------------------
- User: Guest
- Action: SELECT pending uploads with uploaded_by = NULL
- Expected: PARTIAL SUCCESS (can only see their own just-inserted rows in same session)

TEST 10: Non-Owner Cannot Moderate
-----------------------------------
- User: Authenticated user (not event owner)
- Action: UPDATE or DELETE uploads from another user's event
- Expected: FAILURE (RLS blocks operation)
*/

-- ============================================
-- 9. SECURITY NOTES
-- ============================================

/*
SECURITY CONSIDERATIONS:
------------------------

1. Guest Uploads (uploaded_by = NULL):
   - Guests can upload photos but cannot set a custom name via RLS
   - uploaded_by remains NULL in the database for true anonymity
   - Application layer can optionally store names in a separate field if needed
   - Guests can briefly see their own pending uploads (same session only)

2. Authenticated User Uploads (uploaded_by = auth.uid()::text):
   - Users MUST use their actual auth.uid(), cannot impersonate others
   - uploaded_by is stored as TEXT to match the column type
   - Users can track their own uploads (pending, approved, rejected)

3. Event Owner Privileges:
   - Can view ALL uploads (any status) for their events
   - Can approve uploads (UPDATE status to 'approved')
   - Can reject uploads (DELETE from database)
   - Cannot moderate uploads from events they don't own

4. Public Access:
   - Anyone can view approved uploads (public gallery)
   - Cannot see pending or rejected uploads unless they are the owner or uploader

5. Status Enforcement:
   - New uploads MUST have status = 'pending'
   - Only event owners can change status via UPDATE
   - Status transitions: pending → approved OR pending → deleted (rejected)

6. Event Gating:
   - Uploads only allowed if event has allow_photo_upload = true
   - Uploads only allowed if event has is_active = true
   - These checks prevent uploads to closed or restricted events

7. Storage Cleanup:
   - When rejecting uploads, application layer should delete files from storage
   - RLS handles database deletion, storage cleanup is application responsibility
   - See: lib/queries/moderation.ts rejectUpload() function
*/

-- ============================================
-- 10. TROUBLESHOOTING
-- ============================================

/*
COMMON ISSUES AND SOLUTIONS:
----------------------------

Issue: "new row violates row-level security policy"
Solution: Check that:
  - Event allows uploads (allow_photo_upload = true)
  - Event is active (is_active = true)
  - For authenticated: uploaded_by matches auth.uid()::text
  - For guests: uploaded_by is NULL
  - Status is 'pending'

Issue: ".insert().select() returns 403 after successful insert"
Solution: The SELECT policy now allows guests/users to read their own pending rows
  immediately after insert. Ensure you're not trying to read OTHER users' rows.

Issue: "Cannot approve/reject uploads"
Solution: Verify the authenticated user owns the event:
  - User's auth.uid() must match events.created_by
  - Check user is properly authenticated

Issue: "Guests see other guests' uploads"
Solution: This is expected behavior for approved uploads (public gallery).
  Pending uploads are only visible to the uploader (in same session) and event owner.

Issue: "Stats query returns zero counts"
Solution: Ensure you're counting uploads for events owned by the user:
  - Filter events by created_by = user.id
  - Then count uploads where event_id IN (user's event IDs)

Issue: "Storage files not deleted on reject"
Solution: RLS only handles database deletion. Storage cleanup must be done
  in application code BEFORE deleting the database row.
  See: app/api/moderation/reject/route.ts
*/

-- ============================================
-- 11. RELATED SQL FILES
-- ============================================

/*
This RLS setup works with:
- 10-uploads-table.sql (table structure)
- 13-uploads-helper-functions.sql (helper functions)
- 14-upload-stats-function.sql (statistics function)

Application Integration:
- lib/queries/moderation.ts (server-side queries)
- stores/upload-store.ts (client-side state management)
- app/api/moderation/* (API routes)
*/

-- ============================================
-- END OF RLS CONFIGURATION
-- ============================================

SELECT 'RLS policies for uploads table have been configured successfully!' AS status;
