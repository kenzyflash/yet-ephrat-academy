
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Star, Clock, Users, Play, Filter } from "lucide-react";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "mathematics", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "languages", label: "Languages" },
    { value: "history", label: "History & Culture" },
    { value: "technology", label: "Technology" },
    { value: "arts", label: "Arts & Literature" }
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
      title: "Ethiopian History and Culture",
      instructor: "Dr. Alemayehu Tadesse",
      category: "history",
      level: "Beginner",
      duration: "8 weeks",
      students: 1234,
      rating: 4.8,
      image: "/placeholder.svg",
      price: "Free",
      description: "Explore the rich history and diverse culture of Ethiopia from ancient times to modern day."
    },
    {
      id: 2,
      title: "Mathematics for High School",
      instructor: "Prof. Meron Asefa",
      category: "mathematics",
      level: "Intermediate",
      duration: "12 weeks",
      students: 2156,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "500 ETB",
      description: "Comprehensive mathematics course covering algebra, geometry, and calculus fundamentals."
    },
    {
      id: 3,
      title: "English Language Mastery",
      instructor: "Teacher Sarah Johnson",
      category: "languages",
      level: "All Levels",
      duration: "10 weeks",
      students: 3421,
      rating: 4.7,
      image: "/placeholder.svg",
      price: "300 ETB",
      description: "Improve your English speaking, writing, and comprehension skills step by step."
    },
    {
      id: 4,
      title: "Physics Fundamentals",
      instructor: "Dr. Tekle Wolde",
      category: "science",
      level: "Intermediate",
      duration: "14 weeks",
      students: 1876,
      rating: 4.8,
      image: "/placeholder.svg",
      price: "600 ETB",
      description: "Master the principles of physics with practical examples and laboratory work."
    },
    {
      id: 5,
      title: "Computer Programming Basics",
      instructor: "Eng. Dawit Bekele",
      category: "technology",
      level: "Beginner",
      duration: "16 weeks",
      students: 2943,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "800 ETB",
      description: "Learn programming fundamentals with Python and build your first applications."
    },
    {
      id: 6,
      title: "Amharic Literature",
      instructor: "Prof. Genet Assefa",
      category: "arts",
      level: "Intermediate",
      duration: "6 weeks",
      students: 987,
      rating: 4.6,
      image: "/placeholder.svg",
      price: "Free",
      description: "Study classical and modern Amharic literature and develop analytical skills."
    },
    {
      id: 7,
      title: "Chemistry Lab Techniques",
      instructor: "Dr. Hana Teshome",
      category: "science",
      level: "Advanced",
      duration: "12 weeks",
      students: 654,
      rating: 4.7,
      image: "/placeholder.svg",
      price: "700 ETB",
      description: "Advanced chemistry laboratory techniques and experimental procedures."
    },
    {
      id: 8,
      title: "Ethiopian Economics",
      instructor: "Dr. Bereket Mengistu",
      category: "history",
      level: "Intermediate",
      duration: "10 weeks",
      students: 1432,
      rating: 4.5,
      image: "/placeholder.svg",
      price: "400 ETB",
      description: "Understanding Ethiopia's economic development and current market dynamics."
    },
    {
      id: 9,
      title: "Advanced Mathematics",
      instructor: "Prof. Meron Asefa",
      category: "mathematics",
      level: "Advanced",
      duration: "16 weeks",
      students: 876,
      rating: 4.9,
      image: "/placeholder.svg",
      price: "900 ETB",
      description: "Advanced calculus, linear algebra, and mathematical analysis for university preparation."
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-800">EthioLearn</h1>
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
            Discover our comprehensive collection of courses designed to help you excel in your studies and career.
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
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
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
    </div>
  );
};

export default Courses;
