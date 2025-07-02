
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Users, BookOpen, Trophy, Clock, TrendingUp, Star } from "lucide-react";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  school?: string;
  grade?: string;
}

interface ChildProgress {
  childId: string;
  totalCourses: number;
  completedCourses: number;
  totalPoints: number;
  level: number;
  achievements: number;
  studyTimeThisWeek: number;
  recentActivity: string;
}

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchChildrenData();
    }
  }, [user]);

  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch children relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('parent_child_relationships' as any)
        .select(`
          child_id,
          profiles!parent_child_relationships_child_id_fkey (
            id, first_name, last_name, email, school, grade
          )
        `)
        .eq('parent_id', user?.id);

      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError);
        // If relationships table doesn't exist yet, show empty state
        setChildren([]);
        setChildrenProgress([]);
        return;
      }

      const childrenData = relationships?.map((rel: any) => rel.profiles).filter(Boolean) || [];
      setChildren(childrenData);

      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].id);
        
        // Fetch progress for each child
        const progressPromises = childrenData.map(async (child: Child) => {
          return await fetchChildProgress(child.id);
        });
        
        const progressData = await Promise.all(progressPromises);
        setChildrenProgress(progressData.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildProgress = async (childId: string): Promise<ChildProgress | null> => {
    try {
      // Fetch course enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id, progress')
        .eq('user_id', childId);

      // Fetch user points
      const { data: userPoints } = await supabase
        .from('user_points' as any)
        .select('total_points, level')
        .eq('user_id', childId)
        .single();

      // Fetch achievements count
      const { data: achievements } = await supabase
        .from('user_achievements' as any)
        .select('id')
        .eq('user_id', childId);

      // Fetch study sessions for this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('minutes_studied')
        .eq('user_id', childId)
        .gte('date', oneWeekAgo.toISOString().split('T')[0]);

      const totalCourses = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => (e.progress || 0) >= 100).length || 0;
      const studyTimeThisWeek = studySessions?.reduce((sum, session) => sum + (session.minutes_studied || 0), 0) || 0;

      return {
        childId,
        totalCourses,
        completedCourses,
        totalPoints: (userPoints && typeof userPoints === 'object' && 'total_points' in userPoints) ? (userPoints as any).total_points || 0 : 0,
        level: (userPoints && typeof userPoints === 'object' && 'level' in userPoints) ? (userPoints as any).level || 1 : 1,
        achievements: achievements?.length || 0,
        studyTimeThisWeek,
        recentActivity: 'Active this week'
      };
    } catch (error) {
      console.error('Error fetching child progress:', error);
      return {
        childId,
        totalCourses: 0,
        completedCourses: 0,
        totalPoints: 0,
        level: 1,
        achievements: 0,
        studyTimeThisWeek: 0,
        recentActivity: 'No recent activity'
      };
    }
  };

  const getSelectedChildProgress = () => {
    return childrenProgress.find(p => p.childId === selectedChild);
  };

  const getSelectedChild = () => {
    return children.find(c => c.id === selectedChild);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="parent">
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
          <DashboardHeader title="SafHub - Parent Dashboard" />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading dashboard...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="parent">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <DashboardHeader title="SafHub - Parent Dashboard" />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
            <p className="text-gray-600">Monitor your children's learning progress and achievements.</p>
          </div>

          {children.length === 0 ? (
            <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Children Connected</h3>
                <p className="text-gray-500 mb-4">
                  Connect with your children to monitor their learning progress.
                </p>
                <p className="text-sm text-gray-400">
                  Feature coming soon - children relationships management
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Child Selector */}
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  {children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChild === child.id ? "default" : "outline"}
                      onClick={() => setSelectedChild(child.id)}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {child.first_name} {child.last_name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Child Progress Overview */}
              {getSelectedChild() && getSelectedChildProgress() && (
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        {getSelectedChild()?.first_name} {getSelectedChild()?.last_name}
                      </CardTitle>
                      <CardDescription>
                        {getSelectedChild()?.school} - Grade {getSelectedChild()?.grade}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              {getSelectedChildProgress()?.completedCourses}/{getSelectedChildProgress()?.totalCourses}
                            </p>
                            <p className="text-sm text-gray-600">Courses Completed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              {getSelectedChildProgress()?.achievements}
                            </p>
                            <p className="text-sm text-gray-600">Achievements</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Star className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              Level {getSelectedChildProgress()?.level}
                            </p>
                            <p className="text-sm text-gray-600">{getSelectedChildProgress()?.totalPoints} Points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Clock className="h-8 w-8 text-orange-600" />
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              {Math.round((getSelectedChildProgress()?.studyTimeThisWeek || 0) / 60)}h
                            </p>
                            <p className="text-sm text-gray-600">Study Time (Week)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress Details */}
                  <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="progress">Learning Progress</TabsTrigger>
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                      <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress" className="space-y-4">
                      <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>Course Progress</CardTitle>
                          <CardDescription>Overview of enrolled courses and completion status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Overall Progress</span>
                              <span className="text-sm text-gray-600">
                                {getSelectedChildProgress()?.completedCourses}/{getSelectedChildProgress()?.totalCourses} completed
                              </span>
                            </div>
                            <Progress 
                              value={getSelectedChildProgress()?.totalCourses ? 
                                (getSelectedChildProgress()?.completedCourses / getSelectedChildProgress()?.totalCourses) * 100 : 0
                              } 
                              className="h-3" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-4">
                      <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>Recent Achievements</CardTitle>
                          <CardDescription>Latest accomplishments and milestones</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">
                              {getSelectedChildProgress()?.achievements === 0 
                                ? 'No achievements yet. Encourage your child to start learning!'
                                : `Your child has earned ${getSelectedChildProgress()?.achievements} achievements!`
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                          <CardDescription>Latest learning activities and engagement</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">
                              {getSelectedChildProgress()?.recentActivity || 'No recent activity'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ParentDashboard;
