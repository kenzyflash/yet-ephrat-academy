
-- Create the lesson-videos storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos', 
  true,
  104857600, -- 100MB limit for videos
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv']
);

-- Create comprehensive RLS policies for the lesson-videos bucket
CREATE POLICY "Public can view lesson videos" ON storage.objects
FOR SELECT USING (bucket_id = 'lesson-videos');

CREATE POLICY "Authenticated users can upload lesson videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update lesson videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete lesson videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-videos' 
  AND auth.role() = 'authenticated'
);
