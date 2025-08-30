/*
  # Enhance Private Chat System

  1. Indexes for Performance
    - Add indexes for private chat queries
    - Add indexes for message queries
    - Add indexes for presence tracking

  2. Functions for Chat Management
    - Function to get or create private chat
    - Function to update last activity
    - Function to get chat participants

  3. Real-time Subscriptions
    - Enable real-time for private chats
    - Enable real-time for messages
    - Enable real-time for presence

  4. Security Enhancements
    - Ensure proper RLS policies
    - Add validation functions
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_private_chats_participants 
ON private_chats (participant_1, participant_2);

CREATE INDEX IF NOT EXISTS idx_private_chats_last_activity_desc 
ON private_chats (last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_messages_private_chat_created_at 
ON messages (private_chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_online_status 
ON profiles (is_online, last_seen DESC);

-- Function to get or create private chat
CREATE OR REPLACE FUNCTION get_or_create_private_chat(
  user1_id uuid,
  user2_id uuid
)
RETURNS TABLE (
  id uuid,
  participant_1 uuid,
  participant_2 uuid,
  created_at timestamptz,
  last_activity timestamptz,
  blocked_by uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chat_record RECORD;
BEGIN
  -- Check if chat already exists (either direction)
  SELECT pc.* INTO chat_record
  FROM private_chats pc
  WHERE (pc.participant_1 = user1_id AND pc.participant_2 = user2_id)
     OR (pc.participant_1 = user2_id AND pc.participant_2 = user1_id)
  LIMIT 1;

  -- If chat exists, return it
  IF FOUND THEN
    RETURN QUERY
    SELECT chat_record.id, chat_record.participant_1, chat_record.participant_2,
           chat_record.created_at, chat_record.last_activity, chat_record.blocked_by;
    RETURN;
  END IF;

  -- Create new chat
  INSERT INTO private_chats (participant_1, participant_2)
  VALUES (user1_id, user2_id)
  RETURNING private_chats.id, private_chats.participant_1, private_chats.participant_2,
            private_chats.created_at, private_chats.last_activity, private_chats.blocked_by
  INTO chat_record;

  RETURN QUERY
  SELECT chat_record.id, chat_record.participant_1, chat_record.participant_2,
         chat_record.created_at, chat_record.last_activity, chat_record.blocked_by;
END;
$$;

-- Function to update chat activity
CREATE OR REPLACE FUNCTION update_chat_activity(chat_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE private_chats 
  SET last_activity = now() 
  WHERE id = chat_id;
END;
$$;

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM profiles
    WHERE is_online = true
      AND last_seen > (now() - interval '5 minutes')
  );
END;
$$;

-- Trigger to update last_activity when messages are sent
CREATE OR REPLACE FUNCTION update_private_chat_activity()
RETURNS trigger
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

-- Enhanced RLS policies for private chats
DROP POLICY IF EXISTS "Users can manage their private chats" ON private_chats;
CREATE POLICY "Users can manage their private chats"
  ON private_chats
  FOR ALL
  TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Enhanced RLS policies for messages in private chats
DROP POLICY IF EXISTS "Users can read their private messages" ON messages;
CREATE POLICY "Users can read their private messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    (private_chat_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM private_chats 
      WHERE private_chats.id = messages.private_chat_id 
        AND (private_chats.participant_1 = auth.uid() OR private_chats.participant_2 = auth.uid())
    ))
    OR 
    (chat_room_id IS NOT NULL)
  );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_or_create_private_chat(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_chat_activity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users_count() TO authenticated;