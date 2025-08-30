/*
  # Fix admin login and create proper admin user

  1. Admin User Setup
    - Create admin user with proper credentials
    - Set up permissions and roles
    - Enable login functionality

  2. Security
    - Proper password hashing
    - Active status management
    - Role-based access control
*/

-- First, let's make sure we have the admin user with the correct credentials
-- Delete existing admin user if exists
DELETE FROM admin_users WHERE email = 'sumitdhanuk2000@gmail.com';

-- Create the admin user with proper setup
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
  crypt('asdfghjkl', gen_salt('bf')),
  'super_admin',
  '["manage_users", "manage_rooms", "manage_reports", "manage_admins", "broadcast", "view_analytics", "manage_blogs"]'::jsonb,
  true,
  now(),
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = crypt('asdfghjkl', gen_salt('bf')),
  role = 'super_admin',
  permissions = '["manage_users", "manage_rooms", "manage_reports", "manage_admins", "broadcast", "view_analytics", "manage_blogs"]'::jsonb,
  is_active = true,
  updated_at = now();

-- Create a function to verify admin passwords
CREATE OR REPLACE FUNCTION verify_admin_password(email_input text, password_input text)
RETURNS TABLE(
  id uuid,
  email text,
  role text,
  permissions jsonb,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  last_login timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.role,
    au.permissions,
    au.is_active,
    au.created_at,
    au.updated_at,
    au.last_login
  FROM admin_users au
  WHERE au.email = email_input 
    AND au.password_hash = crypt(password_input, au.password_hash)
    AND au.is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated, anon;