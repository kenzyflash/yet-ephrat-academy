import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Calendar, 
  Bell, 
  Play, 
  CheckCircle,
  Target,
  TrendingUp,
  MessageSquare,
  Users,
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ProfileDropdown from "@/components/ProfileDropdown";
import CourseEnrollment from "@/components/dashboard/CourseEnrollment";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useCourseData } from "@/hooks/useCourseData";
import { useStudentProgress } from "@/hooks/useStudentProgress";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  course_title: string;
  status: 'pending' | 'submitted';
}

const StudentDashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tempGoals, setTempGoals] = useState({
    study_hours_goal: 15,
    lessons_goal: 10,
    assignments_goal: 3
  });

  const { courses, enrollments, loading: coursesLoading } = useCourseData();
  const { 
    studySessions, 
    currentGoals, 
    streak, 
    updateWeeklyGoals,
    refetchProgress,
    logStudySession,
    getTotalStudyHours,
    getTotalStudyMinutes,
    getWeeklyStudyProgress
  } = useStudentProgress();
  const { courseProgress, getCourseProgress } = useCourseProgress();

  // Handle page visibility to prevent loading issues when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !dataLoaded) {
        console.log('Tab became visible, refreshing data...');
        fetchUserProfile();
        if (enrollments.length > 0) {
          fetchAssignments();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, dataLoaded, enrollments.length]);

  // Set data loaded state when initial data is ready
  useEffect(() => {
    if (user && !coursesLoading && courses.length >= 0 && enrollments.length >= 0) {
      setDataLoaded(true);
    }
  }, [user, coursesLoading, courses, enrollments]);

  // Debug logging to see what data we have
  useEffect(() => {
    console.log('Courses:', courses);
    console.log('Enrollments:', enrollments);
    console.log('Enrolled courses count:', getEnrolledCourses().length);
  }, [courses, enrollments]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      // Log a study session when user visits dashboard
      logStudySession(15); // 15 minutes for visiting dashboard
    }
  }, [user]);

  useEffect(() => {
    if (enrollments.length > 0) {
      fetchAssignments();
    }
  }, [enrollments]);

  useEffect(() => {
    if (currentGoals) {
      setTempGoals({
        study_hours_goal: currentGoals.study_hours_goal,
        lessons_goal: currentGoals.lessons_goal,
        assignments_goal: currentGoals.assignments_goal
      });
    }
  }, [currentGoals]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAssignments = async () => {
    if (!user || enrollments.length === 0) return;

    try {
      // Get enrolled course IDs
      const enrolledCourseIds = enrollments.map(e => e.course_id);

      // Get assignments for enrolled courses
      const { data: assignmentData, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          courses (
            title
          )
        `)
        .in('course_id', enrolledCourseIds)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Get user's submissions
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('assignment_id')
        .eq('user_id', user.id);

      const submittedIds = submissions?.map(s => s.assignment_id) || [];

      const formattedAssignments: Assignment[] = assignmentData?.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        due_date: assignment.due_date,
        course_title: assignment.courses?.title || 'Unknown Course',
        status: submittedIds.includes(assignment.id) ? 'submitted' : 'pending'
      })) || [];

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const getEnrolledCourses = () => {
    const enrolled = courses.filter(course => 
      enrollments.some(enrollment => enrollment.course_id === course.id)
    );
    console.log('Filtered enrolled courses:', enrolled);
    return enrolled;
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return user?.email?.split('@')[0] || 'Student';
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getWeeklyProgress = () => {
    if (!currentGoals) return { studyHours: 0, lessons: 0, assignments: 0 };

    // Use the improved weekly study progress calculation
    const weeklyStudy = getWeeklyStudyProgress();
    const studyHours = weeklyStudy.hours;

    // Calculate lessons completed this week (simplified)
    const lessonsCompleted = Math.min(Math.floor(studyHours / 2), currentGoals.lessons_goal);
    
    // Get assignments completed
    const assignmentsCompleted = assignments.filter(a => a.status === 'submitted').length;

    console.log('Weekly progress calculated:', {
      studyHours,
      lessonsCompleted,
      assignmentsCompleted,
      weeklyStudy
    });

    return {
      studyHours: Math.min(studyHours, currentGoals.study_hours_goal),
      lessons: lessonsCompleted,
      assignments: Math.min(assignmentsCompleted, currentGoals.assignments_goal)
    };
  };

  const handleUpdateGoals = async () => {
    try {
      await updateWeeklyGoals(tempGoals);
      setIsGoalsDialogOpen(false);
      toast({
        title: "Goals updated",
        description: "Your weekly goals have been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goals",
        variant: "destructive"
      });
    }
  };

  // Improved loading logic - only show loading when actually needed
  const isActuallyLoading = loading || (coursesLoading && !dataLoaded);

  // Show loading while checking authentication or initial data load
  if (isActuallyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or wrong role
  if (!user || (userRole !== 'student' && userRole !== null)) {
    return null;
  }

  const enrolledCourses = getEnrolledCourses();
  const weeklyProgress = getWeeklyProgress();

  // Use the improved study hours calculation
  const totalStudyHours = getTotalStudyHours();
  const totalStudyMinutes = getTotalStudyMinutes();

  console.log('Dashboard stats:', {
    totalStudyHours,
    totalStudyMinutes,
    enrolledCoursesCount: enrolledCourses.length,
    streak
  });

  // Calculate completed courses
  const completedCourses = enrolledCourses.filter(course => {
    const progress = getCourseProgress(course.id);
    return progress && progress.progressPercentage >= 100;
  });

  const stats = [
    { label: "Courses Enrolled", value: enrolledCourses.length.toString(), icon: BookOpen, color: "text-blue-600" },
    { label: "Hours Studied", value: totalStudyHours.toString(), icon: Clock, color: "text-green-600" },
    { label: "Courses Completed", value: completedCourses.length.toString(), icon: Trophy, color: "text-purple-600" },
    { label: "Current Streak", value: `${streak} days`, icon: TrendingUp, color: "text-orange-600" }
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <DashboardHeader title="SafHub" />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile?.avatar_url} alt="Profile" />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {getDisplayName()}!</h1>
              <p className="text-gray-600">Ready to continue your learning journey today?</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content with Tabs */}
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="courses">Browse Courses</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Current Courses */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        My Courses ({enrolledCourses.length})
                      </CardTitle>
                      <CardDescription>Continue your learning journey</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enrolledCourses.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">
                            You haven't enrolled in any courses yet.
                          </p>
                          <p className="text-sm text-gray-400 mb-4">
                            Debug: {enrollments.length} enrollments found, {courses.length} courses total
                          </p>
                          <Button 
                            onClick={() => {
                              const tabsTrigger = document.querySelector('[value="courses"]') as HTMLElement;
                              if (tabsTrigger) tabsTrigger.click();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Browse Available Courses
                          </Button>
                        </div>
                      ) : (
                        enrolledCourses.map((course) => {
                          const progress = getCourseProgress(course.id);
                          const progressPercentage = progress?.progressPercentage || 0;
                          
                          return (
                            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start gap-4">
                                <img 
                                  src={course.image_url || "/placeholder.svg"}
                                  alt={course.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                                  <p className="text-sm text-gray-600 mb-2">by {course.instructor_name}</p>
                                  
                                  <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{progress?.completedLessons || 0}/{progress?.totalLessons || course.total_lessons || 0} lessons</span>
                                      </div>
                                      <Progress value={progressPercentage} className="h-2" />
                                    </div>
                                    <Badge variant="secondary">{Math.round(progressPercentage)}%</Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Level:</span> {course.level}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      className="bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => handleContinueCourse(course.id)}
                                    >
                                      <Play className="mr-1 h-4 w-4" />
                                      Continue
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Upcoming Assignments */}
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Upcoming Assignments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {assignments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No assignments available yet.
                        </p>
                      ) : (
                        assignments.slice(0, 3).map((assignment) => (
                          <div key={assignment.id} className="p-3 border rounded-lg">
                            <h4 className="font-medium text-gray-800 text-sm mb-1">{assignment.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">{assignment.course_title}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                              <Badge 
                                variant={assignment.status === "submitted" ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {assignment.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Study Goals */}
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          Weekly Goals
                        </div>
                        <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Weekly Goals</DialogTitle>
                              <DialogDescription>
                                Set your learning goals for this week
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="study-hours">Study Hours Goal</Label>
                                <Input
                                  id="study-hours"
                                  type="number"
                                  value={tempGoals.study_hours_goal}
                                  onChange={(e) => setTempGoals({...tempGoals, study_hours_goal: parseInt(e.target.value)})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="lessons">Lessons Goal</Label>
                                <Input
                                  id="lessons"
                                  type="number"
                                  value={tempGoals.lessons_goal}
                                  onChange={(e) => setTempGoals({...tempGoals, lessons_goal: parseInt(e.target.value)})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="assignments">Assignments Goal</Label>
                                <Input
                                  id="assignments"
                                  type="number"
                                  value={tempGoals.assignments_goal}
                                  onChange={(e) => setTempGoals({...tempGoals, assignments_goal: parseInt(e.target.value)})}
                                />
                              </div>
                              <Button onClick={handleUpdateGoals} className="w-full">
                                Update Goals
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Study Time</span>
                            <span>{weeklyProgress.studyHours}/{currentGoals?.study_hours_goal || 15} hours</span>
                          </div>
                          <Progress value={(weeklyProgress.studyHours / (currentGoals?.study_hours_goal || 15)) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Lessons Completed</span>
                            <span>{weeklyProgress.lessons}/{currentGoals?.lessons_goal || 10}</span>
                          </div>
                          <Progress value={(weeklyProgress.lessons / (currentGoals?.lessons_goal || 10)) * 100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Assignments</span>
                            <span>{weeklyProgress.assignments}/{currentGoals?.assignments_goal || 3}</span>
                          </div>
                          <Progress value={(weeklyProgress.assignments / (currentGoals?.assignments_goal || 3)) * 100} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses">
              <CourseEnrollment />
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Your learning milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 1, title: "First Course Enrolled", icon: Trophy, earned: enrolledCourses.length > 0 },
                      { id: 2, title: "Study Streak (7 days)", icon: TrendingUp, earned: streak >= 7 },
                      { id: 3, title: "Course Completed", icon: CheckCircle, earned: completedCourses.length > 0 },
                      { id: 4, title: "Study Champion (100 hours)", icon: Clock, earned: totalStudyHours >= 100 }
                    ].map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-lg border text-center ${
                          achievement.earned 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <achievement.icon className={`h-8 w-8 mx-auto mb-2 ${
                          achievement.earned ? 'text-emerald-600' : 'text-gray-400'
                        }`} />
                        <p className="text-sm font-medium text-gray-800">{achievement.title}</p>
                        {achievement.earned && (
                          <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StudentDashboard;
