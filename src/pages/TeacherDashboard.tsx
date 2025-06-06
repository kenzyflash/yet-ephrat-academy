
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare,
  BarChart3,
  Clock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import EnhancedCourseManagement from "@/components/dashboard/EnhancedCourseManagement";
import { useCourseData } from "@/hooks/useCourseData";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecentActivity {
  action: string;
  course: string;
  time: string;
}

interface UpcomingClass {
  course_title: string;
  time: string;
}

const TeacherDashboard = () => {
  const { user, userRole } = useAuth();
  const { courses, loading } = useCourseData();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);

  // Calculate stats from real data
  const totalStudents = courses.reduce((sum, course) => sum + (course.student_count || 0), 0);
  const averageRating = courses.length > 0 
    ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length * 100 / 5).toFixed(0)
    : 0;

  const teacherStats = [
    { label: "My Courses", value: courses.length.toString(), icon: BookOpen, color: "text-blue-600" },
    { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-green-600" },
    { label: "Avg. Rating", value: `${averageRating}%`, icon: BarChart3, color: "text-purple-600" },
    { label: "Next Class", value: "2h", icon: Clock, color: "text-orange-600" }
  ];

  useEffect(() => {
    fetchRecentActivities();
    fetchUpcomingClasses();
  }, [user, courses]);

  const fetchRecentActivities = async () => {
    if (!user || courses.length === 0) return;

    try {
      // Fetch recent discussions from user's courses
      const courseIds = courses.map(course => course.id);
      const { data: discussions, error } = await supabase
        .from('course_discussions')
        .select('content, created_at, course_id')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const activities = discussions?.map(discussion => {
        const course = courses.find(c => c.id === discussion.course_id);
        return {
          action: "New discussion post",
          course: course?.title || "Unknown Course",
          time: new Date(discussion.created_at).toLocaleString()
        };
      }) || [];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Fallback to static data
      setRecentActivities([
        { action: "New assignment submitted", course: "Mathematics Fundamentals", time: "2 hours ago" },
        { action: "Discussion post created", course: "Science Basics", time: "4 hours ago" },
        { action: "Student question posted", course: "English Literature", time: "6 hours ago" }
      ]);
    }
  };

  const fetchUpcomingClasses = async () => {
    if (!user || courses.length === 0) return;

    try {
      // For now, we'll create upcoming classes based on the user's courses
      const upcomingClassesData = courses.slice(0, 2).map(course => ({
        course_title: course.title,
        time: "Today, 2:00 PM"
      }));

      setUpcomingClasses(upcomingClassesData);
    } catch (error) {
      console.error('Error fetching upcoming classes:', error);
      // Fallback to static data
      setUpcomingClasses([
        { course_title: "Mathematics Fundamentals", time: "Today, 2:00 PM" },
        { course_title: "Science Basics", time: "Tomorrow, 10:00 AM" }
      ]);
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
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium text-gray-800 text-sm mb-1">{activity.action}</p>
                      <p className="text-xs text-gray-600 mb-2">{activity.course}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No recent activities</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Upcoming Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingClasses.map((classItem, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium text-gray-800 text-sm">{classItem.course_title}</p>
                        <p className="text-xs text-gray-600">{classItem.time}</p>
                      </div>
                    ))}
                    {upcomingClasses.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No upcoming classes</p>
                      </div>
                    )}
                  </div>
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
