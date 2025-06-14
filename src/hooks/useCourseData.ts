
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  duration: string;
  total_lessons: number;
  category: string;
  level: string;
  rating: number;
  student_count: number;
  price: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
}

export const useCourseData = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      // Fetch courses and filter out those with non-existent instructors
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out courses where instructor doesn't exist in profiles
      const validCourses = (data || []).filter(course => 
        course.profiles && course.instructor_id
      );

      setCourses(validCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to basic query without join if the join fails
      try {
        const { data: basicCourses, error: basicError } = await supabase
          .from('courses')
          .select('*')
          .not('instructor_id', 'is', null)
          .order('created_at', { ascending: false });

        if (basicError) throw basicError;

        // Verify instructors exist in profiles table
        const instructorIds = basicCourses?.map(c => c.instructor_id).filter(Boolean) || [];
        
        if (instructorIds.length > 0) {
          const { data: validInstructors } = await supabase
            .from('profiles')
            .select('id')
            .in('id', instructorIds);

          const validInstructorIds = new Set(validInstructors?.map(p => p.id) || []);
          
          const filteredCourses = basicCourses?.filter(course => 
            course.instructor_id && validInstructorIds.has(course.instructor_id)
          ) || [];

          setCourses(filteredCourses);
        } else {
          setCourses([]);
        }
      } catch (fallbackError) {
        console.error('Error in fallback course fetch:', fallbackError);
        setCourses([]);
      }
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Filter enrollments to only include courses that still exist
      const courseIds = courses.map(c => c.id);
      const validEnrollments = (data || []).filter(enrollment => 
        courseIds.includes(enrollment.course_id)
      );

      setEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0
        });

      if (error) throw error;
      await fetchEnrollments();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  return {
    courses,
    enrollments,
    loading,
    enrollInCourse,
    refetchCourses: fetchCourses,
    refetchEnrollments: fetchEnrollments
  };
};
