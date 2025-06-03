
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Search, Users, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: string;
  image: string;
  isEnrolled: boolean;
}

const CourseEnrollment = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Introduction to Programming',
      instructor: 'Dr. Alemayehu Tadesse',
      description: 'Learn the fundamentals of programming with Python. Perfect for beginners.',
      duration: '8 weeks',
      students: 234,
      rating: 4.8,
      level: 'Beginner',
      price: 'Free',
      image: '/placeholder.svg',
      isEnrolled: false
    },
    {
      id: '2',
      title: 'Digital Marketing Essentials',
      instructor: 'Prof. Meron Asefa',
      description: 'Master digital marketing strategies and tools for modern businesses.',
      duration: '6 weeks',
      students: 456,
      rating: 4.6,
      level: 'Intermediate',
      price: '1,200 ETB',
      image: '/placeholder.svg',
      isEnrolled: false
    },
    {
      id: '3',
      title: 'Ethiopian Literature',
      instructor: 'Teacher Sarah Johnson',
      description: 'Explore the rich tradition of Ethiopian literature and poetry.',
      duration: '10 weeks',
      students: 123,
      rating: 4.9,
      level: 'Intermediate',
      price: 'Free',
      image: '/placeholder.svg',
      isEnrolled: false
    },
    {
      id: '4',
      title: 'Business Management',
      instructor: 'Dr. Bekele Molla',
      description: 'Learn essential business management principles and practices.',
      duration: '12 weeks',
      students: 789,
      rating: 4.7,
      level: 'Advanced',
      price: '2,500 ETB',
      image: '/placeholder.svg',
      isEnrolled: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollCourse = (courseId: string) => {
    setCourses(courses.map(course =>
      course.id === courseId ? { ...course, isEnrolled: true } : course
    ));
    
    setIsEnrollDialogOpen(false);
    setSelectedCourse(null);
    
    toast({
      title: "Enrollment successful!",
      description: "You have been enrolled in the course. Start learning now!",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const enrolledCourses = courses.filter(course => course.isEnrolled);
  const availableCourses = courses.filter(course => !course.isEnrolled);

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
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
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
            {filteredCourses.filter(course => !course.isEnrolled).map((course) => (
              <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={course.image} 
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
                  
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students}
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
                              <p className="text-gray-600 mb-2">Instructor: {selectedCourse.instructor}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseEnrollment;
