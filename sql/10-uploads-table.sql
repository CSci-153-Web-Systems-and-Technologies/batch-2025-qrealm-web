-- ============================================
-- UPLOADS TABLE FOR GUEST PHOTOS
-- ============================================
-- Purpose: Store guest-uploaded photos with moderation workflow
-- ============================================

-- Drop table if exists (for development only - careful in production!)
-- DROP TABLE IF EXISTS public.uploads CASCADE;

-- Create the uploads table
CREATE TABLE IF NOT EXISTS public.uploads (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Event reference (which event this photo belongs to)
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Image URL from Supabase Storage
  image_url TEXT NOT NULL,
  
  -- Guest information (optional - for anonymous uploads)
  uploaded_by TEXT,
  
  -- Photo caption (optional)
  caption TEXT,
  
  -- Moderation status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Who approved/rejected this (admin user)
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- IP address for security/audit (can be populated from API headers)
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE COLUMN EXPLANATIONS
-- ============================================

-- id: Unique identifier for each upload (auto-generated)
-- event_id: Links to the events table, cascade delete if event is deleted
-- image_url: The public URL where the image is stored in Supabase Storage
-- uploaded_by: Guest's name (optional - they can choose to remain anonymous)
-- caption: Optional description of the photo
-- status: Three possible states:
--   - 'pending': New upload awaiting moderation (DEFAULT)
--   - 'approved': Approved by admin, visible in gallery
--   - 'rejected': Rejected by admin, not visible
-- approved_by: Which admin user made the moderation decision
-- ip_address: For security tracking (can detect abuse patterns)
-- created_at/updated_at: Automatic timestamps for auditing

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index 1: Fast lookup by event_id (most common query)
-- This speeds up queries like "get all photos for event X"
CREATE INDEX IF NOT EXISTS idx_uploads_event_id ON public.uploads(event_id);

-- Index 2: Fast filtering by status
-- This speeds up queries like "get all pending uploads"
CREATE INDEX IF NOT EXISTS idx_uploads_status ON public.uploads(status);

-- Index 3: Fast ordering by creation date
-- This speeds up queries like "show latest photos first"
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);

-- Index 4: Composite index for common admin queries
-- This speeds up queries like "get pending uploads for a specific event"
CREATE INDEX IF NOT EXISTS idx_uploads_event_status ON public.uploads(event_id, status);

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_uploads_updated_at ON public.uploads;
CREATE TRIGGER update_uploads_updated_at
  BEFORE UPDATE ON public.uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VALIDATION CHECKS (Optional but recommended)
-- ============================================

-- Check that image_url is a valid URL (basic check)
ALTER TABLE public.uploads 
ADD CONSTRAINT check_image_url_valid 
CHECK (image_url ~ '^https?://.*');

-- Check that if approved_by is set, status is either 'approved' or 'rejected'
ALTER TABLE public.uploads
ADD CONSTRAINT check_approved_by_status 
CHECK (
  (approved_by IS NULL AND status = 'pending') OR
  (approved_by IS NOT NULL AND status IN ('approved', 'rejected'))
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENT ON TABLE AND COLUMNS (Documentation)
-- ============================================

COMMENT ON TABLE public.uploads IS 'Stores guest-uploaded photos with moderation workflow. Each photo is linked to an event and has a status (pending/approved/rejected).';

COMMENT ON COLUMN public.uploads.event_id IS 'Foreign key to events table. Which event this photo belongs to.';
COMMENT ON COLUMN public.uploads.status IS 'Moderation status: pending (default), approved (visible in gallery), rejected (not visible).';
COMMENT ON COLUMN public.uploads.approved_by IS 'Admin user who approved/rejected this upload. NULL if still pending.';
COMMENT ON COLUMN public.uploads.ip_address IS 'IP address of uploader for security/audit purposes.';
COMMENT ON COLUMN public.uploads.created_at IS 'Timestamp when photo was uploaded.';
COMMENT ON COLUMN public.uploads.updated_at IS 'Timestamp when photo was last modified (status change, etc.).';