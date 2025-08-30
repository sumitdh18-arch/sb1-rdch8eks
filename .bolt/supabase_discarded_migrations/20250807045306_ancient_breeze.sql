/*
  # Create storage bucket and policies for chat files

  1. Storage Setup
    - Create 'chat-files' bucket for images and audio files
    - Set up public access policies
    - Configure file size and type restrictions

  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to upload/read files
    - Restrict file types to images and audio only
*/

-- Create the storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for anyone to view uploaded files (since bucket is public)
CREATE POLICY "Anyone can view chat files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-files');

-- Policy for users to delete their own files
CREATE POLICY "Users can delete their own chat files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);