
-- Remove courses where the instructor_id doesn't exist in auth.users or profiles table
DELETE FROM public.courses 
WHERE instructor_id IS NOT NULL 
AND instructor_id NOT IN (
  SELECT id FROM public.profiles
);

-- Also clean up any orphaned course enrollments for deleted courses
DELETE FROM public.course_enrollments 
WHERE course_id NOT IN (
  SELECT id FROM public.courses
);

-- Clean up any orphaned lessons for deleted courses
DELETE FROM public.lessons 
WHERE course_id NOT IN (
  SELECT id FROM public.courses
);

-- Clean up any orphaned assignments for deleted courses
DELETE FROM public.assignments 
WHERE course_id NOT IN (
  SELECT id FROM public.courses
);

-- Clean up any orphaned course discussions for deleted courses
DELETE FROM public.course_discussions 
WHERE course_id NOT IN (
  SELECT id FROM public.courses
);
