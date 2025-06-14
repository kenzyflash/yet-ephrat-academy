
-- First, let's check if the bucket exists and recreate it if needed
DELETE FROM storage.buckets WHERE id = 'course-thumbnails';

-- Create the course-thumbnails storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Remove any existing policies first
DROP POLICY IF EXISTS "Anyone can view course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course thumbnails" ON storage.objects;

-- Create comprehensive RLS policies for the course-thumbnails bucket
CREATE POLICY "Public can view course thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Authenticated users can upload course thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update course thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete course thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-thumbnails' 
  AND auth.role() = 'authenticated'
);
