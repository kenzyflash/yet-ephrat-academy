
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

const TeacherDashboard = () => {
  const { user, userRole } = useAuth();
  const { courses, loading } = useCourseData();

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

  const recentActivities = [
    { action: "New assignment submitted", course: "Workplace Safety Fundamentals", time: "2 hours ago" },
    { action: "Discussion post created", course: "Industrial Safety Protocols", time: "4 hours ago" },
    { action: "Student question posted", course: "Fire Safety and Prevention", time: "6 hours ago" }
  ];

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
            <p className="text-gray-600">Manage your safety courses and connect with your students.</p>
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
                    {courses.slice(0, 2).map((course) => (
                      <div key={course.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-gray-800 text-sm">{course.title}</p>
                        <p className="text-xs text-gray-600">Today, 2:00 PM</p>
                      </div>
                    ))}
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
