import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Award,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StudentDashboard = () => {
  const { user, userRole, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (userRole !== 'student' && userRole !== null))) {
      window.location.href = "/";
    }
  }, [user, userRole, loading]);

  // Show loading while checking authentication
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

  // Redirect if not authenticated or wrong role
  if (!user || (userRole !== 'student' && userRole !== null)) {
    return null;
  }

  const enrolledCourses = [
    {
      id: 1,
      title: "Ethiopian History and Culture",
      instructor: "Dr. Alemayehu Tadesse",
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      nextLesson: "Ancient Civilizations of Ethiopia",
      dueDate: "2024-06-15",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Mathematics for High School",
      instructor: "Prof. Meron Asefa",
      progress: 40,
      totalLessons: 36,
      completedLessons: 14,
      nextLesson: "Quadratic Equations",
      dueDate: "2024-06-20",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "English Language Mastery",
      instructor: "Teacher Sarah Johnson",
      progress: 80,
      totalLessons: 30,
      completedLessons: 24,
      nextLesson: "Advanced Grammar",
      dueDate: "2024-06-12",
      image: "/placeholder.svg"
    }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: "Essay on Ethiopian Independence",
      course: "Ethiopian History",
      dueDate: "2024-06-15",
      status: "pending"
    },
    {
      id: 2,
      title: "Algebra Problem Set #5",
      course: "Mathematics",
      dueDate: "2024-06-18",
      status: "started"
    },
    {
      id: 3,
      title: "English Comprehension Test",
      course: "English",
      dueDate: "2024-06-20",
      status: "pending"
    }
  ];

  const achievements = [
    { id: 1, title: "First Course Completed", icon: Trophy, earned: true },
    { id: 2, title: "Quiz Master", icon: Target, earned: true },
    { id: 3, title: "Study Streak (7 days)", icon: TrendingUp, earned: false },
    { id: 4, title: "Community Helper", icon: MessageSquare, earned: false }
  ];

  const stats = [
    { label: "Courses Enrolled", value: "3", icon: BookOpen, color: "text-blue-600" },
    { label: "Hours Studied", value: "47", icon: Clock, color: "text-green-600" },
    { label: "Certificates Earned", value: "1", icon: Award, color: "text-purple-600" },
    { label: "Current Streak", value: "5 days", icon: TrendingUp, color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">EthioLearn</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.email?.split('@')[0] || 'Student'}!</h1>
          <p className="text-gray-600">Ready to continue your learning journey today?</p>
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Current Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  My Courses
                </CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          <Badge variant="secondary">{course.progress}%</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Next:</span> {course.nextLesson}
                          </div>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            <Play className="mr-1 h-4 w-4" />
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Achievements
                </CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
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
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-gray-800 text-sm mb-1">{assignment.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{assignment.course}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Due: {assignment.dueDate}</span>
                      <Badge variant={assignment.status === "started" ? "default" : "secondary"} className="text-xs">
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Goals */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Study Time</span>
                      <span>12/15 hours</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lessons Completed</span>
                      <span>8/10</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Assignments</span>
                      <span>2/3</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Activity */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">New Discussion</p>
                    <p className="text-gray-600">"Help with Math Problem #15"</p>
                    <p className="text-xs text-gray-500">Mathematics Course</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Study Group</p>
                    <p className="text-gray-600">"Ethiopian History Study Session"</p>
                    <p className="text-xs text-gray-500">Tomorrow, 3:00 PM</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Join Discussions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
