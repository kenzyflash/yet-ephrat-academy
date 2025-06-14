
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Bell, 
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import EnhancedCourseManagement from "@/components/dashboard/EnhancedCourseManagement";
import SubmissionManagement from "@/components/dashboard/SubmissionManagement";
import { useCourseData } from "@/hooks/useCourseData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentActivity {
  action: string;
  course: string;
  time: string;
}

const TeacherDashboard = () => {
  const { user, userRole } = useAuth();
  const { courses, loading } = useCourseData();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Filter courses to show only those created by the current user
  const userCourses = courses.filter(course => course.instructor_id === user?.id);

  // Calculate stats from real data
  const totalStudents = userCourses.reduce((sum, course) => sum + (course.student_count || 0), 0);
  const averageRating = userCourses.length > 0 
    ? (userCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / userCourses.length * 100 / 5).toFixed(0)
    : 0;

  const teacherStats = [
    { label: "My Courses", value: userCourses.length.toString(), icon: BookOpen, color: "text-blue-600" },
    { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-green-600" },
    { label: "Avg. Rating", value: `${averageRating}%`, icon: BarChart3, color: "text-purple-600" },
    { label: "Total Lessons", value: userCourses.reduce((sum, course) => sum + (course.total_lessons || 0), 0).toString(), icon: TrendingUp, color: "text-orange-600" }
  ];

  useEffect(() => {
    fetchRecentActivities();
  }, [user, userCourses]);

  const fetchRecentActivities = async () => {
    if (!user || userCourses.length === 0) {
      setRecentActivities([]);
      return;
    }

    try {
      const courseIds = userCourses.map(course => course.id);
      const { data: discussions, error } = await supabase
        .from('course_discussions')
        .select('content, created_at, course_id')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const activities = discussions?.map(discussion => {
        const course = userCourses.find(c => c.id === discussion.course_id);
        return {
          action: "New discussion post",
          course: course?.title || "Unknown Course",
          time: new Date(discussion.created_at).toLocaleString()
        };
      }) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
          <DashboardHeader title="SafHub - Teacher" />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <DashboardHeader title="SafHub - Teacher" />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Teacher!</h1>
            <p className="text-gray-600">Manage your courses and connect with your students.</p>
          </div>

          <DashboardStats stats={teacherStats} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <EnhancedCourseManagement />
              <SubmissionManagement />
            </div>

            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium text-gray-800 text-sm mb-1">{activity.action}</p>
                        <p className="text-xs text-gray-600 mb-2">{activity.course}</p>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No recent activities</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;
