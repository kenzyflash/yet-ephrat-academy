
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Bell, 
  Plus,
  MessageSquare,
  BarChart3,
  Clock,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";

const TeacherDashboard = () => {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || userRole !== 'teacher')) {
      window.location.href = "/";
    }
  }, [user, userRole, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'teacher') {
    return null;
  }

  const teacherStats = [
    { label: "My Courses", value: "2", icon: BookOpen, color: "text-blue-600" },
    { label: "Total Students", value: "2,090", icon: Users, color: "text-green-600" },
    { label: "Avg. Completion", value: "72%", icon: BarChart3, color: "text-purple-600" },
    { label: "Next Class", value: "2h", icon: Clock, color: "text-orange-600" }
  ];

  const teacherCourses = [
    {
      id: 1,
      title: "Ethiopian History and Culture",
      students: 1234,
      nextClass: "Today, 2:00 PM",
      status: "Active",
      completionRate: 78
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      students: 856,
      nextClass: "Tomorrow, 10:00 AM",
      status: "Active",
      completionRate: 65
    }
  ];

  const recentActivities = [
    { action: "New assignment submitted", course: "Ethiopian History", time: "2 hours ago" },
    { action: "Discussion post created", course: "Advanced Mathematics", time: "4 hours ago" },
    { action: "Student question posted", course: "Ethiopian History", time: "6 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <DashboardHeader title="EthioLearn - Teacher" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Teacher!</h1>
          <p className="text-gray-600">Manage your courses and connect with your students.</p>
        </div>

        <DashboardStats stats={teacherStats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      My Courses
                    </CardTitle>
                    <CardDescription>Manage and track your courses</CardDescription>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    New Course
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teacherCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students.toLocaleString()} students
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {course.nextClass}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{course.status}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Completion Rate:</span> {course.completionRate}%
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Discussion
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-gray-800 text-sm">Ethiopian History</p>
                    <p className="text-xs text-gray-600">Today, 2:00 PM</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-gray-800 text-sm">Advanced Mathematics</p>
                    <p className="text-xs text-gray-600">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
