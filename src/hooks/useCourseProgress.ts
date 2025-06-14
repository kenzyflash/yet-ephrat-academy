
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonProgress {
  id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  watch_time_minutes: number;
  completed_at: string | null;
}

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export const useCourseProgress = (courseId?: string) => {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (courseId) {
        fetchSingleCourseProgress(courseId);
      } else {
        fetchAllCourseProgress();
      }
    }
  }, [user, courseId]);

  const fetchSingleCourseProgress = async (id: string) => {
    if (!user) return;

    try {
      // Get total lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', id);

      if (lessonsError) throw lessonsError;

      const totalLessons = lessons?.length || 0;

      // Get completed lessons
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressError) throw progressError;

      const completedLessons = progress?.length || 0;
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      setCourseProgress([{
        courseId: id,
        completedLessons,
        totalLessons,
        progressPercentage
      }]);

      // Update course enrollment progress
      await updateEnrollmentProgress(id, progressPercentage);
    } catch (error) {
      console.error('Error fetching course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourseProgress = async () => {
    if (!user) return;

    try {
      // Get all enrollments for the user
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments || enrollments.length === 0) {
        setCourseProgress([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);
      const progressData: CourseProgress[] = [];

      for (const courseId of courseIds) {
        // Get total lessons for each course
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', courseId);

        if (lessonsError) {
          console.error('Error fetching lessons for course:', courseId, lessonsError);
          continue;
        }

        const totalLessons = lessons?.length || 0;

        // Get completed lessons for each course
        const { data: progress, error: progressError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) {
          console.error('Error fetching progress for course:', courseId, progressError);
          continue;
        }

        const completedLessons = progress?.length || 0;
        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        progressData.push({
          courseId,
          completedLessons,
          totalLessons,
          progressPercentage
        });

        // Update course enrollment progress
        await updateEnrollmentProgress(courseId, progressPercentage);
      }

      setCourseProgress(progressData);
    } catch (error) {
      console.error('Error fetching all course progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentProgress = async (courseId: string, progressPercentage: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({ progress: progressPercentage })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
    }
  };

  const markLessonComplete = async (lessonId: string, courseId: string, watchTimeMinutes: number = 0) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          watch_time_minutes: watchTimeMinutes,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh progress
      if (courseId) {
        await fetchSingleCourseProgress(courseId);
      } else {
        await fetchAllCourseProgress();
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  };

  const getCourseProgress = (id: string): CourseProgress | undefined => {
    return courseProgress.find(cp => cp.courseId === id);
  };

  const refetchProgress = async () => {
    if (courseId) {
      await fetchSingleCourseProgress(courseId);
    } else {
      await fetchAllCourseProgress();
    }
  };

  return {
    courseProgress,
    loading,
    markLessonComplete,
    getCourseProgress,
    refetchProgress
  };
};
