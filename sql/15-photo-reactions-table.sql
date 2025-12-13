-- ==========================================
-- Photo Reactions Table
-- ==========================================
-- Stores likes/reactions for uploaded photos
-- Supports multiple reaction types (heart, sparkle, etc.)

-- Drop existing table if it exists
DROP TABLE IF EXISTS photo_reactions CASCADE;

-- Create photo_reactions table
CREATE TABLE photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'heart',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_reaction_type CHECK (reaction_type IN ('heart', 'sparkle', 'like', 'love')),
  -- Prevent duplicate reactions from same user/IP
  CONSTRAINT unique_user_reaction UNIQUE NULLS NOT DISTINCT (upload_id, user_id, reaction_type),
  CONSTRAINT unique_ip_reaction UNIQUE NULLS NOT DISTINCT (upload_id, ip_address, reaction_type),
  -- At least one identifier must be present
  CONSTRAINT has_identifier CHECK (user_id IS NOT NULL OR ip_address IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX idx_photo_reactions_upload_id ON photo_reactions(upload_id);
CREATE INDEX idx_photo_reactions_user_id ON photo_reactions(user_id);
CREATE INDEX idx_photo_reactions_ip_address ON photo_reactions(ip_address);
CREATE INDEX idx_photo_reactions_type ON photo_reactions(reaction_type);
CREATE INDEX idx_photo_reactions_created_at ON photo_reactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE photo_reactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies for photo_reactions
-- ==========================================

-- Allow anyone to view reactions (read-only)
CREATE POLICY "Anyone can view photo reactions"
  ON photo_reactions
  FOR SELECT
  USING (true);

-- Allow authenticated users to add reactions
CREATE POLICY "Authenticated users can add reactions"
  ON photo_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON photo_reactions
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- Allow guests (unauthenticated) to add reactions using IP
CREATE POLICY "Guests can add reactions via IP"
  ON photo_reactions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL AND
    ip_address IS NOT NULL AND
    user_id IS NULL
  );

-- Allow guests to delete their own reactions via IP
CREATE POLICY "Guests can delete their own reactions via IP"
  ON photo_reactions
  FOR DELETE
  USING (
    auth.uid() IS NULL AND
    ip_address IS NOT NULL AND
    user_id IS NULL
  );

-- ==========================================
-- Helper Functions
-- ==========================================

-- Function to get reaction counts for an upload
CREATE OR REPLACE FUNCTION get_photo_reaction_counts(upload_uuid UUID)
RETURNS TABLE(reaction_type VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.reaction_type,
    COUNT(*)::BIGINT as count
  FROM photo_reactions pr
  WHERE pr.upload_id = upload_uuid
  GROUP BY pr.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user/IP has reacted to a photo
CREATE OR REPLACE FUNCTION has_user_reacted(
  upload_uuid UUID,
  user_uuid UUID DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  react_type VARCHAR DEFAULT 'heart'
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM photo_reactions
    WHERE upload_id = upload_uuid
      AND reaction_type = react_type
      AND (
        (user_uuid IS NOT NULL AND user_id = user_uuid) OR
        (ip_addr IS NOT NULL AND ip_address = ip_addr)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle reaction (add if not exists, remove if exists)
CREATE OR REPLACE FUNCTION toggle_photo_reaction(
  upload_uuid UUID,
  user_uuid UUID DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  react_type VARCHAR DEFAULT 'heart'
)
RETURNS JSON AS $$
DECLARE
  existing_reaction UUID;
  new_count BIGINT;
  action_taken VARCHAR;
BEGIN
  -- Validate that at least one identifier is provided
  IF user_uuid IS NULL AND ip_addr IS NULL THEN
    RAISE EXCEPTION 'Either user_id or ip_address must be provided';
  END IF;

  -- Check if reaction already exists
  SELECT id INTO existing_reaction
  FROM photo_reactions
  WHERE upload_id = upload_uuid
    AND reaction_type = react_type
    AND (
      (user_uuid IS NOT NULL AND user_id = user_uuid) OR
      (ip_addr IS NOT NULL AND ip_address = ip_addr AND user_id IS NULL)
    )
  LIMIT 1;

  IF existing_reaction IS NOT NULL THEN
    -- Remove reaction
    DELETE FROM photo_reactions WHERE id = existing_reaction;
    action_taken := 'removed';
  ELSE
    -- Add reaction
    INSERT INTO photo_reactions (upload_id, user_id, ip_address, reaction_type)
    VALUES (upload_uuid, user_uuid, ip_addr, react_type);
    action_taken := 'added';
  END IF;

  -- Get updated count
  SELECT COUNT(*) INTO new_count
  FROM photo_reactions
  WHERE upload_id = upload_uuid AND reaction_type = react_type;

  RETURN json_build_object(
    'action', action_taken,
    'reaction_type', react_type,
    'count', new_count,
    'has_reacted', (action_taken = 'added')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Comments
-- ==========================================

COMMENT ON TABLE photo_reactions IS 'Stores user reactions (likes, hearts, sparkles) for uploaded photos';
COMMENT ON COLUMN photo_reactions.upload_id IS 'Reference to the photo upload';
COMMENT ON COLUMN photo_reactions.user_id IS 'Authenticated user who reacted (NULL for guests)';
COMMENT ON COLUMN photo_reactions.ip_address IS 'IP address for guest reactions (NULL for authenticated users)';
COMMENT ON COLUMN photo_reactions.reaction_type IS 'Type of reaction: heart, sparkle, like, or love';
COMMENT ON FUNCTION toggle_photo_reaction IS 'Toggles a reaction on/off for a photo. Returns action taken and new count.';
COMMENT ON FUNCTION get_photo_reaction_counts IS 'Returns all reaction counts for a specific upload';
COMMENT ON FUNCTION has_user_reacted IS 'Checks if a user/IP has already reacted to a photo';
