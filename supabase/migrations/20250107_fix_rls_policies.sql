
-- Fix RLS policies for assignments
DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view assignments" ON public.assignments;

CREATE POLICY "Teachers can manage assignments" 
  ON public.assignments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = assignments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = assignments.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view assignments" 
  ON public.assignments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.course_id = assignments.course_id 
      AND course_enrollments.user_id = auth.uid()
    )
  );

-- Fix RLS policies for assignment submissions
DROP POLICY IF EXISTS "Students can manage submissions" ON public.assignment_submissions;

CREATE POLICY "Students can manage submissions" 
  ON public.assignment_submissions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for lessons
DROP POLICY IF EXISTS "Teachers can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Students can view lessons" ON public.lessons;

CREATE POLICY "Teachers can manage lessons" 
  ON public.lessons 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view lessons" 
  ON public.lessons 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments 
      WHERE course_enrollments.course_id = lessons.course_id 
      AND course_enrollments.user_id = auth.uid()
    )
  );

-- Fix RLS policies for courses
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Public can view courses" ON public.courses;

CREATE POLICY "Teachers can manage courses" 
  ON public.courses 
  FOR ALL 
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Public can view courses" 
  ON public.courses 
  FOR SELECT 
  USING (true);

-- Fix RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for lesson videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-videos', 'lesson-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course thumbnails
CREATE POLICY "Public can view course thumbnails" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Teachers can upload course thumbnails" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'course-thumbnails' 
    AND auth.role() = 'authenticated'
  );

-- Create storage policies for lesson videos
CREATE POLICY "Enrolled students can view lesson videos" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'lesson-videos' 
    AND (
      auth.role() = 'authenticated'
    )
  );

CREATE POLICY "Teachers can upload lesson videos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'lesson-videos' 
    AND auth.role() = 'authenticated'
  );
