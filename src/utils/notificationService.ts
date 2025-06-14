
import { supabase } from '@/integrations/supabase/client';

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'course_release' | 'assignment' | 'enrollment' | 'grade' | 'general' = 'general'
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const createCourseReleaseNotification = async (courseName: string) => {
  try {
    // Get all student users
    const { data: students, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (error) throw error;

    const notifications = students?.map(student => ({
      user_id: student.user_id,
      title: 'New Course Available',
      message: `A new course "${courseName}" is now available for enrollment!`,
      type: 'course_release',
      is_read: false
    })) || [];

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error creating course release notifications:', error);
  }
};

export const createEnrollmentWelcomeNotification = async (userId: string, courseName: string) => {
  await createNotification(
    userId,
    'Welcome to Your New Course!',
    `Congratulations! You've successfully enrolled in "${courseName}". Start your learning journey today!`,
    'enrollment'
  );
};

export const createAssignmentNotification = async (userId: string, assignmentTitle: string, courseName: string, dueDate: string) => {
  const formattedDate = new Date(dueDate).toLocaleDateString();
  await createNotification(
    userId,
    'New Assignment Available',
    `"${assignmentTitle}" has been assigned in ${courseName}. Due: ${formattedDate}`,
    'assignment'
  );
};
