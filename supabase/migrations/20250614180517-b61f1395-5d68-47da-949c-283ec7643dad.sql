
-- Add foreign key constraints to assignment_submissions table
ALTER TABLE public.assignment_submissions 
ADD CONSTRAINT fk_assignment_submissions_assignment_id 
FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE public.assignment_submissions 
ADD CONSTRAINT fk_assignment_submissions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to assignments table
ALTER TABLE public.assignments 
ADD CONSTRAINT fk_assignments_course_id 
FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.assignments 
ADD CONSTRAINT fk_assignments_created_by 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to courses table
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_instructor_id 
FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
