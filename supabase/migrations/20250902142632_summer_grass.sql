/*
  # Fix private_chats reference

  1. Remove any references to private_chats table/view
  2. Ensure private_chats table has all necessary columns
  3. Add any missing indexes for performance
*/

-- Remove the private_chats view if it exists
DROP VIEW IF EXISTS private_chats;

-- Ensure private_chats table has all necessary columns
DO $$
BEGIN
  -- Check if participant_1_username column exists and remove it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'private_chats' AND column_name = 'participant_1_username'
  ) THEN
    ALTER TABLE private_chats DROP COLUMN participant_1_username;
  END IF;

  -- Check if participant_1_avatar column exists and remove it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'private_chats' AND column_name = 'participant_1_avatar'
  ) THEN
    ALTER TABLE private_chats DROP COLUMN participant_1_avatar;
  END IF;

  -- Check if participant_2_username column exists and remove it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'private_chats' AND column_name = 'participant_2_username'
  ) THEN
    ALTER TABLE private_chats DROP COLUMN participant_2_username;
  END IF;

  -- Check if participant_2_avatar column exists and remove it if it does
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'private_chats' AND column_name = 'participant_2_avatar'
  ) THEN
    ALTER TABLE private_chats DROP COLUMN participant_2_avatar;
  END IF;
END $$;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_private_chats_participants_combined 
ON private_chats (participant_1, participant_2);

CREATE INDEX IF NOT EXISTS idx_private_chats_last_activity_desc 
ON private_chats (last_activity DESC);

-- Create a function to get private chat with participant details
CREATE OR REPLACE FUNCTION get_private_chats_with_participants(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  participant_1 uuid,
  participant_2 uuid,
  created_at timestamptz,
  last_activity timestamptz,
  blocked_by uuid,
  participant_1_username text,
  participant_1_avatar text,
  participant_2_username text,
  participant_2_avatar text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.participant_1,
    pc.participant_2,
    pc.created_at,
    pc.last_activity,
    pc.blocked_by,
    p1.username as participant_1_username,
    p1.avatar_url as participant_1_avatar,
    p2.username as participant_2_username,
    p2.avatar_url as participant_2_avatar
  FROM private_chats pc
  LEFT JOIN profiles p1 ON pc.participant_1 = p1.id
  LEFT JOIN profiles p2 ON pc.participant_2 = p2.id
  WHERE pc.participant_1 = user_id_param OR pc.participant_2 = user_id_param
  ORDER BY pc.last_activity DESC;
END;
$$;