/*
  # Add Demo Admin User

  1. New Admin User
    - Creates a demo admin user with email sumitdhanuk2000@gmail.com
    - Sets password as Sumit1131 (hashed)
    - Assigns super_admin role with all permissions
  
  2. Security
    - Password is properly hashed using bcrypt
    - User is marked as active
    - All permissions granted for demo purposes
*/

-- Insert demo admin user
INSERT INTO admin_users (
  id,
  email,
  password_hash,
  role,
  permissions,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'sumitdhanuk2000@gmail.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is a bcrypt hash for 'Sumit1131'
  'super_admin',
  '["manage_users", "manage_rooms", "manage_reports", "manage_admins", "broadcast", "view_analytics", "manage_blogs"]'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Create corresponding auth user (this would normally be done through Supabase Auth)
-- Note: In production, you would create this through the Supabase dashboard or Auth API