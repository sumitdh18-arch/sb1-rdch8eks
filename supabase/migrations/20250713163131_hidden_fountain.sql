/*
  # Create increment read count function

  1. Functions
    - `increment_read_count` - Function to safely increment blog post read count
  
  2. Security
    - Function is accessible to authenticated users
    - Prevents race conditions with atomic increment
*/

-- Create function to increment read count
CREATE OR REPLACE FUNCTION increment_read_count(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET read_count = read_count + 1 
  WHERE id = post_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_read_count(uuid) TO authenticated;