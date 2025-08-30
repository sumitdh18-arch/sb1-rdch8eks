-- Add RPC function to increment blog post read count
CREATE OR REPLACE FUNCTION increment_read_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts 
  SET read_count = read_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_messages', (
      SELECT COUNT(*) FROM messages WHERE sender_id = user_id
    ),
    'total_reports', (
      SELECT COUNT(*) FROM reports WHERE reported_by = user_id
    ),
    'unread_notifications', (
      SELECT COUNT(*) FROM notifications WHERE user_id = user_id AND is_read = false
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC function to clean up old messages (for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  -- Delete messages older than 30 days
  DELETE FROM messages 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;