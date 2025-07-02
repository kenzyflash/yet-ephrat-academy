
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  instructor_name: string;
  image_url?: string;
}

interface CourseProgressProps {
  courses: Course[];
}

const CourseProgress = ({ courses }: CourseProgressProps) => {
  if (courses.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            My Courses
          </CardTitle>
          <CardDescription>Your enrolled courses and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Button asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          My Courses
        </CardTitle>
        <CardDescription>Continue your learning journey</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{course.instructor_name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={course.progress} className="flex-1 h-2" />
                    <span className="text-sm text-gray-500">{course.progress}%</span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/course/${course.id}`} className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgress;
