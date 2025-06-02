
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  ArrowLeft,
  Download,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useToast } from "@/hooks/use-toast";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState(0);
  const { toast } = useToast();

  // Use the course progress hook
  const {
    progress,
    markLessonComplete,
    isLessonCompleted,
    getCompletedLessonsCount
  } = useCourseProgress(courseId || '');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

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

  if (!user) {
    return null;
  }

  // Mock course data - in real app this would come from your database
  const course = {
    id: courseId,
    title: "Ethiopian History and Culture",
    instructor: "Dr. Alemayehu Tadesse",
    description: "Explore the rich history and diverse culture of Ethiopia from ancient times to modern day.",
    duration: "8 weeks",
    students: 1234,
    rating: 4.8,
    image: "/placeholder.svg",
    lessons: [
      {
        id: 1,
        title: "Introduction to Ethiopian History",
        duration: "45 min",
        videoUrl: "#",
        description: "Overview of Ethiopian civilization and its significance in world history."
      },
      {
        id: 2,
        title: "Ancient Ethiopian Kingdoms",
        duration: "50 min",
        videoUrl: "#",
        description: "Study of the Kingdom of Aksum and other ancient Ethiopian states."
      },
      {
        id: 3,
        title: "The Zagwe Dynasty",
        duration: "40 min",
        videoUrl: "#",
        description: "Exploration of the Zagwe period and the rock churches of Lalibela."
      },
      {
        id: 4,
        title: "Medieval Ethiopia",
        duration: "55 min",
        videoUrl: "#",
        description: "The Solomonic dynasty and medieval Ethiopian society."
      },
      {
        id: 5,
        title: "Modern Ethiopian History",
        duration: "60 min",
        videoUrl: "#",
        description: "Ethiopia in the 20th and 21st centuries."
      }
    ]
  };

  const currentLesson = course.lessons[selectedLesson];
  const completedLessonsCount = getCompletedLessonsCount();
  const courseProgress = progress.overallProgress;

  const handleLessonComplete = () => {
    markLessonComplete(currentLesson.id);
  };

  const handleDownloadResources = () => {
    toast({
      title: "Resources downloading",
      description: "Course materials are being prepared for download.",
    });
  };

  const handleDiscussion = () => {
    toast({
      title: "Discussion forum",
      description: "Opening course discussion forum...",
    });
  };

  const getDashboardUrl = () => {
    if (userRole === 'admin') return '/admin-dashboard';
    if (userRole === 'teacher') return '/teacher-dashboard';
    return '/student-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(getDashboardUrl())}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-800">EthioLearn</h1>
            </div>
          </div>
          <ProfileDropdown />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <img 
              src={course.image} 
              alt={course.title}
              className="w-32 h-32 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">by {course.instructor}</p>
              <p className="text-gray-700 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Course Progress</span>
                  <span>{completedLessonsCount}/{course.lessons.length} lessons completed</span>
                </div>
                <Progress value={courseProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">{currentLesson.title}</p>
                    <p className="text-sm opacity-75">{currentLesson.duration}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{currentLesson.title}</h2>
                  <p className="text-gray-600 mb-4">{currentLesson.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleLessonComplete}
                      disabled={isLessonCompleted(currentLesson.id)}
                      className={`${
                        isLessonCompleted(currentLesson.id) 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isLessonCompleted(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
                    </Button>
                    <Button variant="outline" onClick={handleDownloadResources}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Resources
                    </Button>
                    <Button variant="outline" onClick={handleDiscussion}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discussion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Outline */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  {completedLessonsCount} of {course.lessons.length} lessons completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedLesson === index
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLesson(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-800 mb-1">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-600">{lesson.duration}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLessonCompleted(lesson.id) && (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          )}
                          <Badge variant={selectedLesson === index ? "default" : "secondary"} className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
