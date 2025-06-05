
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import UserManagement from "@/components/dashboard/UserManagement";

const AdminDashboard = () => {
  const { user, userRole } = useAuth();

  const systemStats = [
    { label: "Total Users", value: "5,432", icon: Users, color: "text-blue-600", change: "+12%" },
    { label: "Active Courses", value: "124", icon: BookOpen, color: "text-green-600", change: "+8%" },
    { label: "Teachers", value: "89", icon: GraduationCap, color: "text-purple-600", change: "+5%" },
    { label: "Monthly Revenue", value: "45,230 USD", icon: TrendingUp, color: "text-orange-600", change: "+18%" }
  ];

  const recentActions = [
    { action: "New teacher registered", user: "Dr. Meron Asefa", time: "2 hours ago" },
    { action: "Course approved", course: "Physics Fundamentals", time: "4 hours ago" },
    { action: "User role updated", user: "Abebe Tadesse", time: "6 hours ago" },
    { action: "System backup completed", details: "All data secured", time: "8 hours ago" }
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <DashboardHeader title="SafHub - Admin" showSettings />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Administrator Dashboard</h1>
            <p className="text-gray-600">Monitor and manage the SafHub platform.</p>
          </div>

          <DashboardStats stats={systemStats} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <UserManagement />
            </div>

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
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Server Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Database Size</span>
                      <span className="font-medium">2.4 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Sessions</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Support Tickets</span>
                      <span className="font-medium text-orange-600">12 pending</span>
                    </div>
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

export default AdminDashboard;
