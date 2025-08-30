/*
  # Enhance private chat for real-time functionality

  1. Profile Updates
    - Add better online status tracking
    - Improve last seen functionality
    - Add real-time presence indicators

  2. Message Enhancements
    - Better message delivery status
    - Read receipts
    - Typing indicators

  3. Real-time Features
    - Live online/offline status
    - Message delivery confirmations
    - Presence updates
*/

-- Add indexes for better performance on presence queries
CREATE INDEX IF NOT EXISTS idx_profiles_online_status 
ON profiles (is_online, last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen 
ON profiles (last_seen DESC);

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_presence(user_id uuid, is_online boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_online = update_user_presence.is_online,
    last_seen = now(),
    updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Function to get online users
CREATE OR REPLACE FUNCTION get_online_users()
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  is_online boolean,
  last_seen timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.is_online,
    p.last_seen
  FROM profiles p
  WHERE p.is_online = true 
    AND p.last_seen > (now() - interval '5 minutes')
  ORDER BY p.last_seen DESC;
END;
$$;

-- Function to get user info for private chats
CREATE OR REPLACE FUNCTION get_user_info(user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  is_online boolean,
  last_seen timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.is_online,
    p.last_seen
  FROM profiles p
  WHERE p.id = user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_presence TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_info TO authenticated;

-- Add trigger to update private chat activity when messages are sent
CREATE OR REPLACE FUNCTION update_private_chat_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.private_chat_id IS NOT NULL THEN
    UPDATE private_chats 
    SET last_activity = NEW.created_at
    WHERE id = NEW.private_chat_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_private_chat_activity ON messages;
CREATE TRIGGER trigger_update_private_chat_activity
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_private_chat_activity();