
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Star, Clock, Users, Play, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import Footer from "@/components/Footer";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "mathematics", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "english", label: "English" },
    { value: "social-studies", label: "Social Studies" },
    { value: "amharic", label: "Amharic" },
    { value: "geography", label: "Geography" }
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  const allCourses = [
    {
      id: 1,
      title: "Mathematics Fundamentals",
      instructor: "Dr. Meron Asefa",
      category: "mathematics",
      level: "Beginner",
      duration: "4 weeks",
      students: 1234,
      rating: 4.8,
      image: "/placeholder.svg",
      price: "Free",
      description: "Learn essential mathematics principles and problem-solving techniques for Ethiopian curriculum."
    },
    {
      id: 2,
      title: "Ethiopian History",
      instructor: "Prof. Abebe Kebede",
      category: "social-studies",
      level: "Intermediate",
      duration: "6 weeks",
      students: 2156,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "299 Birr",
      description: "Comprehensive Ethiopian history course covering ancient civilizations to modern times."
    },
    {
      id: 3,
      title: "English Language Skills",
      instructor: "Ms. Hanna Tadesse",
      category: "english",
      level: "All Levels",
      duration: "3 weeks",
      students: 3421,
      rating: 4.7,
      image: "/placeholder.svg",
      price: "199 Birr",
      description: "Essential English language skills for Ethiopian students including reading, writing, and speaking."
    },
    {
      id: 4,
      title: "Biology Fundamentals",
      instructor: "Dr. Dawit Alemayehu",
      category: "science",
      level: "Intermediate",
      duration: "5 weeks",
      students: 1876,
      rating: 4.8,
      image: "/placeholder.svg",
      price: "349 Birr",
      description: "Comprehensive biology course covering cell structure, genetics, and ecosystem dynamics."
    },
    {
      id: 5,
      title: "Advanced Chemistry",
      instructor: "Prof. Sara Getachew",
      category: "science",
      level: "Advanced",
      duration: "8 weeks",
      students: 987,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "499 Birr",
      description: "Advanced chemistry course for preparing for university entrance exams."
    },
    {
      id: 6,
      title: "Geography of Ethiopia",
      instructor: "Mr. Tekle Wolde",
      category: "geography",
      level: "Intermediate",
      duration: "6 weeks",
      students: 1654,
      rating: 4.6,
      image: "/placeholder.svg",
      price: "399 Birr",
      description: "Comprehensive geography course focusing on Ethiopian landscapes, climate, and regions."
    },
    {
      id: 7,
      title: "Amharic Literature",
      instructor: "Dr. Almaz Tesfaye",
      category: "amharic",
      level: "Advanced",
      duration: "10 weeks",
      students: 1243,
      rating: 4.7,
      image: "/placeholder.svg",
      price: "549 Birr",
      description: "Advanced Amharic literature course covering classical and modern Ethiopian literature."
    },
    {
      id: 8,
      title: "Physics Concepts",
      instructor: "Prof. Yonas Bekele",
      category: "science",
      level: "Intermediate",
      duration: "7 weeks",
      students: 876,
      rating: 4.5,
      image: "/placeholder.svg",
      price: "429 Birr",
      description: "Essential physics concepts including mechanics, electricity, and magnetism."
    },
    {
      id: 9,
      title: "Advanced Mathematics",
      instructor: "Dr. Meseret Hailu",
      category: "mathematics",
      level: "Advanced",
      duration: "12 weeks",
      students: 654,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "699 Birr",
      description: "Advanced mathematics course for university preparation including calculus and statistics."
    }
  ];

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level.toLowerCase() === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">SafHub</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">Home</a>
            <a href="/courses" className="text-emerald-600 font-medium">Courses</a>
            <a href="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</a>
            <a href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            All Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive collection of safety courses designed to help you excel in your safety career.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {allCourses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    {course.students.toLocaleString()} students
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

        {/* No results message */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </section>

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
      
      <Footer />
    </div>
  );
};

export default Courses;
