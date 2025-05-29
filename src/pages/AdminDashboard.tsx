import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Settings, 
  Bell, 
  BarChart3,
  UserCheck,
  GraduationCap,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";

const AdminDashboard = () => {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    console.log('AdminDashboard - user:', user?.email, 'role:', userRole, 'loading:', loading);
    if (!loading && (!user || userRole !== 'admin')) {
      console.log('Redirecting to home - not admin');
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

  if (!user || userRole !== 'admin') {
    return null;
  }

  const systemStats = [
    { label: "Total Users", value: "5,432", icon: Users, color: "text-blue-600", change: "+12%" },
    { label: "Active Courses", value: "124", icon: BookOpen, color: "text-green-600", change: "+8%" },
    { label: "Teachers", value: "89", icon: GraduationCap, color: "text-purple-600", change: "+5%" },
    { label: "Monthly Revenue", value: "45,230 ETB", icon: TrendingUp, color: "text-orange-600", change: "+18%" }
  ];

  const recentActions = [
    { action: "New teacher registered", user: "Dr. Meron Asefa", time: "2 hours ago" },
    { action: "Course approved", course: "Physics Fundamentals", time: "4 hours ago" },
    { action: "User role updated", user: "Abebe Tadesse", time: "6 hours ago" },
    { action: "System backup completed", details: "All data secured", time: "8 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">EthioLearn - Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrator Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the EthioLearn platform.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">{stat.change}</span>
                    </div>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - System Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" />
                  System Management
                </CardTitle>
                <CardDescription>Quick access to administrative functions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 mb-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BookOpen className="h-6 w-6 mb-2" />
                    Course Approval
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <UserCheck className="h-6 w-6 mb-2" />
                    Role Management
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Platform Overview
                </CardTitle>
                <CardDescription>Key metrics and platform health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">User Growth (This Month)</span>
                    <Badge variant="secondary">+347 users</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Course Completion Rate</span>
                    <Badge className="bg-emerald-600">73%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">System Uptime</span>
                    <Badge className="bg-green-600">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Support Tickets</span>
                    <Badge variant="outline">12 pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activities */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Recent Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActions.map((action, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium text-gray-800 text-sm mb-1">{action.action}</p>
                    <p className="text-xs text-gray-600 mb-2">
                      {action.user || action.course || action.details}
                    </p>
                    <span className="text-xs text-gray-500">{action.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Students Online</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Teachers Active</span>
                    <span className="font-medium">67</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Courses in Progress</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>New Registrations Today</span>
                    <span className="font-medium">23</span>
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

export default AdminDashboard;
