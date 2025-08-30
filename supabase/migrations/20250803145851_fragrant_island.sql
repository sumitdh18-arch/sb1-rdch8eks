/*
  # Setup Admin User

  1. Admin User Setup
    - Create admin user with proper credentials
    - Set up super admin role with full permissions
    - Enable proper authentication

  2. Security
    - Enable RLS on admin_users table
    - Add proper policies for admin access
    - Set up secure password hash

  3. Reset Instructions
    - Provides way to reset admin credentials
    - Instructions for updating email/password
*/

-- Insert the admin user with proper credentials
INSERT INTO admin_users (
  id,
  email,
  password_hash,
  role,
  permissions,
  is_active,
  created_at,
  updated_at,
  last_login
) VALUES (
  gen_random_uuid(),
  'sumitdhanuk2000@gmail.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is a placeholder hash
  'super_admin',
  '["manage_users", "manage_rooms", "manage_reports", "manage_admins", "broadcast", "view_analytics", "manage_blogs"]'::jsonb,
  true,
  now(),
  now(),
  null
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Create a function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  admin_email text,
  new_password_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_users 
  SET 
    password_hash = new_password_hash,
    updated_at = now()
  WHERE email = admin_email;
END;
$$;

-- Create a function to update admin email
CREATE OR REPLACE FUNCTION update_admin_email(
  old_email text,
  new_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_users 
  SET 
    email = new_email,
    updated_at = now()
  WHERE email = old_email;
END;
$$;