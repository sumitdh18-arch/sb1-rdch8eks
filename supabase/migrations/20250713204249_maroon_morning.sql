/*
  # Admin System Tables

  1. New Tables
    - `admin_users` - Store admin accounts with roles and permissions
    - `admin_sessions` - Track admin login sessions
    - `broadcast_messages` - Store broadcast messages sent by admins
    - `admin_actions` - Log all admin actions for audit trail

  2. Security
    - Enable RLS on all admin tables
    - Add policies for admin access only
    - Add audit logging for admin actions

  3. Functions
    - Function to check admin permissions
    - Function to log admin actions
    - Function to send notifications to users
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  permissions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  created_by uuid REFERENCES admin_users(id)
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Broadcast messages table
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  message text NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('all', 'room', 'user')),
  target_id text,
  recipients_count integer DEFAULT 0,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Super admins can manage all admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.role = 'super_admin'
      AND au.is_active = true
    )
  );

CREATE POLICY "Admins can read their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admin sessions policies
CREATE POLICY "Admins can manage their own sessions"
  ON admin_sessions
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid());

-- Broadcast messages policies
CREATE POLICY "Admins can manage broadcasts"
  ON broadcast_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- Admin actions policies
CREATE POLICY "Admins can view admin actions"
  ON admin_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.is_active = true
    )
  );

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
  admin_id uuid,
  required_permission text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = admin_id
    AND is_active = true
    AND (
      role = 'super_admin'
      OR permissions ? required_permission
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_id uuid,
  action_type text,
  target_type text DEFAULT NULL,
  target_id text DEFAULT NULL,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
  VALUES (admin_id, action_type, target_type, target_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send notification to user
CREATE OR REPLACE FUNCTION send_user_notification(
  target_user_id uuid,
  notification_type text,
  title text,
  message text,
  from_admin_id uuid DEFAULT NULL,
  action_type text DEFAULT NULL,
  report_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, from_user, action_type, report_id)
  VALUES (target_user_id, notification_type, title, message, from_admin_id, action_type, report_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'online_users', (SELECT COUNT(*) FROM profiles WHERE is_online = true),
    'total_chat_rooms', (SELECT COUNT(*) FROM chat_rooms),
    'total_messages', (SELECT COUNT(*) FROM messages),
    'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
    'banned_users', (SELECT COUNT(*) FROM profiles WHERE id IN (
      SELECT reported_user FROM reports WHERE status = 'resolved' AND action = 'ban_user'
    )),
    'total_notifications', (SELECT COUNT(*) FROM notifications),
    'total_private_chats', (SELECT COUNT(*) FROM private_chats),
    'messages_today', (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'reports_today', (SELECT COUNT(*) FROM reports WHERE created_at >= CURRENT_DATE)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default super admin
INSERT INTO admin_users (email, password_hash, role, permissions, is_active)
VALUES (
  'admin@chatapp.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'super_admin',
  '["manage_users", "manage_rooms", "manage_reports", "manage_admins", "broadcast", "view_analytics", "manage_blogs"]'::jsonb,
  true
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_admin_id ON broadcast_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_sent_at ON broadcast_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();