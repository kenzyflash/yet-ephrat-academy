
-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'trophy',
  points INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user points table for tracking total points
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forums table for community discussions
CREATE TABLE public.forums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add parent role to app_role enum
ALTER TYPE public.app_role ADD VALUE 'parent';

-- Create parent_child_relationships table
CREATE TABLE public.parent_child_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  relationship_type TEXT DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (get_current_user_role() = 'admin');

-- RLS Policies for user achievements
CREATE POLICY "Users can view their achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- RLS Policies for user points
CREATE POLICY "Users can view their points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their points" ON public.user_points FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for forums
CREATE POLICY "Anyone can view active forums" ON public.forums FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers and admins can create forums" ON public.forums FOR INSERT WITH CHECK (get_current_user_role() IN ('teacher', 'admin'));
CREATE POLICY "Forum creators can update their forums" ON public.forums FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for forum posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for forum replies
CREATE POLICY "Anyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for parent-child relationships
CREATE POLICY "Parents can view their relationships" ON public.parent_child_relationships FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Children can view their relationships" ON public.parent_child_relationships FOR SELECT USING (auth.uid() = child_id);
CREATE POLICY "Parents can create relationships" ON public.parent_child_relationships FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, points, category) VALUES
('First Login', 'Welcome to SafHub! You have successfully logged in for the first time.', 'user-check', 10, 'milestone'),
('Course Completed', 'Congratulations! You have completed your first course.', 'graduation-cap', 50, 'learning'),
('Study Streak 7', 'Amazing! You have studied for 7 days in a row.', 'calendar', 25, 'consistency'),
('Forum Contributor', 'Thank you for contributing to our community discussions.', 'message-circle', 15, 'community'),
('Assignment Master', 'Excellent work! You have submitted 10 assignments.', 'file-text', 30, 'academic');

-- Create function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(user_id_param UUID, achievement_name_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  existing_award RECORD;
BEGIN
  -- Get the achievement
  SELECT * INTO achievement_record FROM public.achievements WHERE name = achievement_name_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has this achievement
  SELECT * INTO existing_award FROM public.user_achievements 
  WHERE user_id = user_id_param AND achievement_id = achievement_record.id;
  
  IF FOUND THEN
    RETURN FALSE; -- Already has achievement
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (user_id, achievement_id) 
  VALUES (user_id_param, achievement_record.id);
  
  -- Update user points
  INSERT INTO public.user_points (user_id, total_points, level)
  VALUES (user_id_param, achievement_record.points, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + achievement_record.points,
    level = CASE 
      WHEN (user_points.total_points + achievement_record.points) >= 500 THEN 5
      WHEN (user_points.total_points + achievement_record.points) >= 300 THEN 4
      WHEN (user_points.total_points + achievement_record.points) >= 150 THEN 3
      WHEN (user_points.total_points + achievement_record.points) >= 50 THEN 2
      ELSE 1
    END,
    updated_at = now();
  
  RETURN TRUE;
END;
$$;
