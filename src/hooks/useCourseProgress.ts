
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LessonProgress {
  lessonId: number;
  completed: boolean;
  completedAt?: Date;
}

interface CourseProgress {
  courseId: string;
  lessons: LessonProgress[];
  overallProgress: number;
}

export const useCourseProgress = (courseId: string) => {
  const [progress, setProgress] = useState<CourseProgress>(() => {
    // Get progress from localStorage for now (in real app this would be from database)
    const saved = localStorage.getItem(`course_progress_${courseId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      courseId,
      lessons: [],
      overallProgress: 0
    };
  });
  
  const { toast } = useToast();

  const markLessonComplete = (lessonId: number) => {
    setProgress(prev => {
      const existingLessonIndex = prev.lessons.findIndex(l => l.lessonId === lessonId);
      let updatedLessons;
      
      if (existingLessonIndex >= 0) {
        updatedLessons = prev.lessons.map(lesson => 
          lesson.lessonId === lessonId 
            ? { ...lesson, completed: true, completedAt: new Date() }
            : lesson
        );
      } else {
        updatedLessons = [
          ...prev.lessons,
          { lessonId, completed: true, completedAt: new Date() }
        ];
      }
      
      // Calculate overall progress (assuming we know total lessons)
      const totalLessons = 5; // This would come from course data
      const completedCount = updatedLessons.filter(l => l.completed).length;
      const overallProgress = Math.round((completedCount / totalLessons) * 100);
      
      const newProgress = {
        ...prev,
        lessons: updatedLessons,
        overallProgress
      };
      
      // Save to localStorage (in real app this would save to database)
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(newProgress));
      
      return newProgress;
    });

    toast({
      title: "Lesson completed!",
      description: "Great job! Keep up the excellent work.",
    });
  };

  const isLessonCompleted = (lessonId: number): boolean => {
    return progress.lessons.some(l => l.lessonId === lessonId && l.completed);
  };

  const getCompletedLessonsCount = (): number => {
    return progress.lessons.filter(l => l.completed).length;
  };

  return {
    progress,
    markLessonComplete,
    isLessonCompleted,
    getCompletedLessonsCount
  };
};
