/*
  # Fix Private Chat Function

  1. Functions
    - `get_or_create_private_chat` - Efficiently finds or creates private chats
    - Handles both directions of participant lookup
    - Returns consistent chat data structure

  2. Security
    - Proper RLS enforcement
    - User authentication checks
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_or_create_private_chat(uuid, uuid);

-- Create improved function to get or create private chat
CREATE OR REPLACE FUNCTION get_or_create_private_chat(
  user1_id uuid,
  user2_id uuid
)
RETURNS TABLE(
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
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Ensure the requesting user is one of the participants
  IF auth.uid() != user1_id AND auth.uid() != user2_id THEN
    RAISE EXCEPTION 'Unauthorized: User must be a participant';
  END IF;
  
  -- Try to find existing chat (check both directions)
  SELECT pc.* INTO chat_record
  FROM private_chats pc
  WHERE (pc.participant_1 = user1_id AND pc.participant_2 = user2_id)
     OR (pc.participant_1 = user2_id AND pc.participant_2 = user1_id)
  LIMIT 1;
  
  -- If chat exists, return it
  IF FOUND THEN
    RETURN QUERY
    SELECT 
      chat_record.id,
      chat_record.participant_1,
      chat_record.participant_2,
      chat_record.created_at,
      chat_record.last_activity,
      chat_record.blocked_by;
    RETURN;
  END IF;
  
  -- Create new chat if it doesn't exist
  INSERT INTO private_chats (participant_1, participant_2)
  VALUES (user1_id, user2_id)
  RETURNING 
    private_chats.id,
    private_chats.participant_1,
    private_chats.participant_2,
    private_chats.created_at,
    private_chats.last_activity,
    private_chats.blocked_by
  INTO chat_record;
  
  -- Return the new chat
  RETURN QUERY
  SELECT 
    chat_record.id,
    chat_record.participant_1,
    chat_record.participant_2,
    chat_record.created_at,
    chat_record.last_activity,
    chat_record.blocked_by;
END;
$$;