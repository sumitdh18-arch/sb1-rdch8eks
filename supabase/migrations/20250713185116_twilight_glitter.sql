/*
  # Fix Private Chats UUID Issues

  1. Tables
    - Ensure private_chats table has proper UUID constraints
    - Add indexes for better query performance
    - Fix any data type issues

  2. Security
    - Update RLS policies for better private chat access
    - Ensure proper user isolation

  3. Performance
    - Add composite indexes for participant queries
    - Optimize for common query patterns
*/

-- Ensure the private_chats table exists with proper structure
CREATE TABLE IF NOT EXISTS private_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  blocked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT different_participants CHECK (participant_1 != participant_2),
  CONSTRAINT unique_participants UNIQUE (participant_1, participant_2)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_private_chats_participant_1 ON private_chats(participant_1);
CREATE INDEX IF NOT EXISTS idx_private_chats_participant_2 ON private_chats(participant_2);
CREATE INDEX IF NOT EXISTS idx_private_chats_last_activity ON private_chats(last_activity DESC);

-- Composite index for finding chats between two users
CREATE INDEX IF NOT EXISTS idx_private_chats_participants ON private_chats(participant_1, participant_2);

-- Enable RLS
ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their private chats" ON private_chats;
DROP POLICY IF EXISTS "Users can create private chats" ON private_chats;
DROP POLICY IF EXISTS "Users can update their private chats" ON private_chats;

-- Create comprehensive RLS policies
CREATE POLICY "Users can read their private chats"
  ON private_chats
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = participant_1 OR 
    auth.uid() = participant_2
  );

CREATE POLICY "Users can create private chats"
  ON private_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = participant_1 OR 
    auth.uid() = participant_2
  );

CREATE POLICY "Users can update their private chats"
  ON private_chats
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = participant_1 OR 
    auth.uid() = participant_2
  )
  WITH CHECK (
    auth.uid() = participant_1 OR 
    auth.uid() = participant_2
  );

-- Ensure messages table has proper foreign key to private_chats
DO $$
BEGIN
  -- Check if the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_private_chat_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_private_chat_id_fkey 
    FOREIGN KEY (private_chat_id) REFERENCES private_chats(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index on messages for private chat queries
CREATE INDEX IF NOT EXISTS idx_messages_private_chat_id ON messages(private_chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_private_chat_created_at ON messages(private_chat_id, created_at);

-- Function to update last_activity when messages are added
CREATE OR REPLACE FUNCTION update_private_chat_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.private_chat_id IS NOT NULL THEN
    UPDATE private_chats 
    SET last_activity = NEW.created_at 
    WHERE id = NEW.private_chat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_activity
DROP TRIGGER IF EXISTS trigger_update_private_chat_activity ON messages;
CREATE TRIGGER trigger_update_private_chat_activity
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_private_chat_activity();