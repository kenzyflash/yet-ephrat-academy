
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { CourseManagement } from "@/components/dashboard/CourseManagement";
import { AdminSettings } from "@/components/dashboard/AdminSettings";
import { Users, BookOpen, Activity, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
}

interface RecentAction {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user_email?: string;
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0
  });
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats with simpler queries
      const [usersResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('course_enrollments').select('id', { count: 'exact' })
      ]);

      // Fetch recent actions with proper joins
      const { data: actionsData } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          created_at,
          profiles!course_enrollments_student_id_fkey(email),
          courses(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const formattedActions: RecentAction[] = (actionsData || []).map(action => ({
        id: action.id,
        type: 'enrollment',
        description: `User enrolled in ${action.courses?.title || 'Unknown Course'}`,
        timestamp: action.created_at,
        user_email: action.profiles?.email
      }));

      setStats({
        totalUsers: usersResponse.count || 0,
        totalCourses: coursesResponse.count || 0,
        totalEnrollments: enrollmentsResponse.count || 0,
        activeUsers: Math.floor((usersResponse.count || 0) * 0.7) // Estimate 70% active
      });

      setRecentActions(formattedActions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchDashboardData();
    }
  }, [user, userRole]);

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userRole={userRole || ''} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform and monitor system activity</p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalEnrollments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading recent actions...</p>
            ) : recentActions.length > 0 ? (
              <div className="space-y-4">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{action.description}</p>
                      {action.user_email && (
                        <p className="text-sm text-gray-500">by {action.user_email}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(action.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent actions found.</p>
            )}
          </CardContent>
        </Card>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="courses">Course Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="courses" className="mt-6">
            <CourseManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
