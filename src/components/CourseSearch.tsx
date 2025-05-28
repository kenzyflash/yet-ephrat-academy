
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users, Star, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const CourseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();

  const allCourses = [
    {
      id: 1,
      title: "Ethiopian History and Culture",
      instructor: "Dr. Alemayehu Tadesse",
      level: "Beginner",
      duration: "8 weeks",
      students: 1234,
      rating: 4.8,
      image: "/placeholder.svg",
      price: "Free",
      description: "Explore the rich history and diverse culture of Ethiopia"
    },
    {
      id: 2,
      title: "Mathematics for High School",
      instructor: "Prof. Meron Asefa",
      level: "Intermediate",
      duration: "12 weeks",
      students: 2156,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "500 ETB",
      description: "Comprehensive mathematics course covering algebra and geometry"
    },
    {
      id: 3,
      title: "English Language Mastery",
      instructor: "Teacher Sarah Johnson",
      level: "All Levels",
      duration: "10 weeks",
      students: 3421,
      rating: 4.7,
      image: "/placeholder.svg",
      price: "300 ETB",
      description: "Improve your English speaking and writing skills"
    }
  ];

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleEnrollClick = () => {
    if (user) {
      window.location.href = "/student-dashboard";
    } else {
      setShowRegister(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search courses, instructors, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <div className="relative">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">
                {course.level}
              </Badge>
              <Badge variant="secondary" className="absolute top-3 right-3">
                {course.price}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="text-gray-600">
                by {course.instructor}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>
              <Button onClick={handleEnrollClick} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Play className="mr-2 h-4 w-4" />
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      )}

      <LoginModal 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal 
        open={showRegister} 
        onOpenChange={setShowRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default CourseSearch;
