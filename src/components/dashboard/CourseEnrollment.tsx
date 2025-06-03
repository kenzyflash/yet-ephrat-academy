
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Users, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourseData } from '@/hooks/useCourseData';
import { useAuth } from '@/contexts/AuthContext';

const CourseEnrollment = () => {
  const { user } = useAuth();
  const { courses, enrollments, loading, enrollInCourse } = useCourseData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) return;

    try {
      await enrollInCourse(courseId);
      setIsEnrollDialogOpen(false);
      setSelectedCourse(null);
      
      toast({
        title: "Enrollment successful!",
        description: "You have been enrolled in the course. Start learning now!",
      });
    } catch (error) {
      toast({
        title: "Enrollment failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const enrolledCourses = courses.filter(course => isEnrolled(course.id));
  const availableCourses = courses.filter(course => !isEnrolled(course.id));

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* My Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              My Enrolled Courses
            </CardTitle>
            <CardDescription>Continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img 
                    src={course.image_url || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor_name}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => window.location.href = `/course/${course.id}`}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browse Available Courses */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Browse Available Courses
          </CardTitle>
          <CardDescription>Discover new courses to expand your knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses by title, instructor, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.filter(course => !isEnrolled(course.id)).map((course) => (
              <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={course.image_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{course.title}</h3>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor_name}</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.student_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-600">{course.price}</span>
                    <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setSelectedCourse(course)}
                        >
                          Enroll Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enroll in Course</DialogTitle>
                          <DialogDescription>
                            Confirm your enrollment in this course.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCourse && (
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                              <h3 className="font-semibold text-lg mb-2">{selectedCourse.title}</h3>
                              <p className="text-gray-600 mb-2">Instructor: {selectedCourse.instructor_name}</p>
                              <p className="text-gray-700 mb-3">{selectedCourse.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Duration: {selectedCourse.duration}</span>
                                <span>Price: {selectedCourse.price}</span>
                                <span>Level: {selectedCourse.level}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleEnrollCourse(selectedCourse.id)} 
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Confirm Enrollment
                              </Button>
                              <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No results message */}
          {filteredCourses.filter(course => !isEnrolled(course.id)).length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseEnrollment;
