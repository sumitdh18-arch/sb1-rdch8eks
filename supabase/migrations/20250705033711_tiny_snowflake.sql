/*
  # Initial Schema Setup for Anonymous Chat Platform

  1. New Tables
    - `profiles` - User profiles with anonymous usernames
    - `chat_rooms` - Public chat rooms
    - `private_chats` - Private conversations between users
    - `messages` - All messages (public and private)
    - `notifications` - User notifications
    - `reports` - User reports and moderation
    - `blog_posts` - Platform announcements and blog content

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
    - Ensure users can only access their own data

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for real-time chat performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create private_chats table (must be created before messages table)
CREATE TABLE IF NOT EXISTS private_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  blocked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(participant_1, participant_2)
);

ALTER TABLE private_chats ENABLE ROW LEVEL SECURITY;

-- Create messages table (references private_chats, so must come after)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  chat_room_id text REFERENCES chat_rooms(id) ON DELETE CASCADE,
  private_chat_id uuid REFERENCES private_chats(id) ON DELETE CASCADE,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio')),
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'call', 'system', 'admin_action')),
  title text NOT NULL,
  message text NOT NULL,
  from_user uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  action_type text,
  report_id uuid
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_message uuid REFERENCES messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed', 'escalated')),
  action text,
  action_by text,
  action_timestamp timestamptz,
  admin_notes text,
  category text DEFAULT 'other' CHECK (category IN ('harassment', 'spam', 'inappropriate_content', 'hate_speech', 'other'))
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  read_count integer DEFAULT 0
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Chat rooms policies
CREATE POLICY "Anyone can read chat rooms"
  ON chat_rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create chat rooms"
  ON chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Private chats policies
CREATE POLICY "Users can read their private chats"
  ON private_chats
  FOR SELECT
  TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Users can create private chats"
  ON private_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Users can update their private chats"
  ON private_chats
  FOR UPDATE
  TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Messages policies
CREATE POLICY "Users can read messages in public rooms"
  ON messages
  FOR SELECT
  TO authenticated
  USING (chat_room_id IS NOT NULL);

CREATE POLICY "Users can read their private messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    private_chat_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM private_chats 
      WHERE id = private_chat_id 
      AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can read their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Reports policies
CREATE POLICY "Users can read their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());

CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

-- Blog posts policies
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (published = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen);

CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_private_chat_id ON messages(private_chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_private_chats_participant_1 ON private_chats(participant_1);
CREATE INDEX IF NOT EXISTS idx_private_chats_participant_2 ON private_chats(participant_2);
CREATE INDEX IF NOT EXISTS idx_private_chats_last_activity ON private_chats(last_activity DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for blog_posts table
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default chat rooms
INSERT INTO chat_rooms (id, name, description, created_by) VALUES
  ('general', 'General Chat', 'Welcome to the general discussion room - chat about anything!', NULL),
  ('tech-talk', 'Tech Talk', 'Discuss latest technology, programming, and innovations', NULL),
  ('gaming-hub', 'Gaming Hub', 'Share your gaming experiences and discover new games', NULL),
  ('music-lounge', 'Music Lounge', 'Share and discover amazing music from around the world', NULL),
  ('sports-arena', 'Sports Arena', 'Discuss your favorite sports, teams, and matches', NULL),
  ('study-group', 'Study Group', 'Academic discussions, study tips, and learning together', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert welcome blog post
INSERT INTO blog_posts (title, content, excerpt, author, published, tags) VALUES
  ('Welcome to Anonymous Chat!', 
   'Welcome to our anonymous chat platform! We''re excited to have you join our community of users from around the world.

Here are some key features you can enjoy:

🌟 **Anonymous Chatting**: Your identity remains completely private. Choose any username and start chatting without revealing personal information.

💬 **Multiple Chat Rooms**: Join themed chat rooms based on your interests - from technology and gaming to music and sports.

🔒 **Private Messaging**: Have one-on-one conversations with other users in complete privacy.

📞 **Voice Calls**: Connect with others through anonymous voice calls.

🛡️ **Safe Environment**: Our moderation team works 24/7 to ensure a safe and respectful environment for everyone.

📱 **Mobile Friendly**: Chat seamlessly across all your devices with our responsive design.

**Getting Started:**
1. Choose a unique username
2. Browse available chat rooms
3. Start conversations by clicking on usernames
4. Enjoy anonymous, safe chatting!

**Community Guidelines:**
- Be respectful to all users
- No harassment or bullying
- Keep conversations appropriate
- Report any inappropriate behavior

We hope you have a great time connecting with people from around the world. Happy chatting!

- The Anonymous Chat Team',
   'Welcome to our anonymous chat platform! Learn about our features and how to get started with safe, anonymous chatting.',
   'Anonymous Chat Team',
   true,
   ARRAY['welcome', 'getting-started', 'features']
  );