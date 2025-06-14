
-- Add missing columns to course_discussions table
ALTER TABLE public.course_discussions 
ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.course_discussions(id) ON DELETE CASCADE;

-- Create discussion_downvotes table
CREATE TABLE IF NOT EXISTS public.discussion_downvotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id uuid NOT NULL REFERENCES public.course_discussions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(discussion_id, user_id)
);

-- Create functions for downvote management
CREATE OR REPLACE FUNCTION public.increment_downvotes(discussion_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $function$
  UPDATE public.course_discussions 
  SET downvotes = COALESCE(downvotes, 0) + 1 
  WHERE id = discussion_id;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_downvotes(discussion_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $function$
  UPDATE public.course_discussions 
  SET downvotes = GREATEST(COALESCE(downvotes, 0) - 1, 0) 
  WHERE id = discussion_id;
$function$;

-- Enable RLS on discussion_downvotes table
ALTER TABLE public.discussion_downvotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discussion_downvotes
CREATE POLICY "Users can view all downvotes" 
  ON public.discussion_downvotes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own downvotes" 
  ON public.discussion_downvotes 
  FOR ALL 
  USING (auth.uid() = user_id);
