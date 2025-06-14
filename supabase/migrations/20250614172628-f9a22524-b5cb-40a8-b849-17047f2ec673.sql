
-- Enable RLS on assignment_submissions table
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow students to insert their own submissions
CREATE POLICY "Students can create their own submissions" 
  ON public.assignment_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow students to view their own submissions
CREATE POLICY "Students can view their own submissions" 
  ON public.assignment_submissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow teachers to view submissions for their course assignments
CREATE POLICY "Teachers can view submissions for their assignments" 
  ON public.assignment_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = assignment_submissions.assignment_id 
        AND c.instructor_id = auth.uid()
    )
  );

-- Policy to allow teachers to update submissions for their course assignments (for grading)
CREATE POLICY "Teachers can update submissions for their assignments" 
  ON public.assignment_submissions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = assignment_submissions.assignment_id 
        AND c.instructor_id = auth.uid()
    )
  );
