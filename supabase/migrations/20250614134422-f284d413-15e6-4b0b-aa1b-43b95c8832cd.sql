
-- Enable RLS on lesson_progress table if not already enabled
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own lesson progress
CREATE POLICY "Users can view their own lesson progress" 
  ON public.lesson_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own lesson progress
CREATE POLICY "Users can create their own lesson progress" 
  ON public.lesson_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own lesson progress
CREATE POLICY "Users can update their own lesson progress" 
  ON public.lesson_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own lesson progress
CREATE POLICY "Users can delete their own lesson progress" 
  ON public.lesson_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);
