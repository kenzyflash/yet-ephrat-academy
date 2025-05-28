import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Award, Clock, Search, Star, Play, LogOut } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuth();

  const featuredCourses = [
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
      description: "Explore the rich history and diverse culture of Ethiopia from ancient times to modern day."
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
      description: "Comprehensive mathematics course covering algebra, geometry, and calculus fundamentals."
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
      description: "Improve your English speaking, writing, and comprehension skills step by step."
    }
  ];

  const stats = [
    { icon: BookOpen, value: "500+", label: "Courses Available" },
    { icon: Users, value: "10,000+", label: "Active Students" },
    { icon: Award, value: "95%", label: "Success Rate" },
    { icon: Clock, value: "24/7", label: "Access Anytime" }
  ];

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
            <h1 className="text-2xl font-bold text-gray-800">EthioLearn</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors">Courses</a>
            <a href="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</a>
            <a href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                <Button variant="outline" onClick={() => window.location.href = "/student-dashboard"}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowLogin(true)}>
                  Sign In
                </Button>
                <Button onClick={() => setShowRegister(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 animate-fade-in">
            Unlock Your Potential with
            <span className="text-emerald-600 block">EthioLearn</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">
            Join thousands of Ethiopian students learning at their own pace. 
            Access quality education, track your progress, and achieve your dreams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" onClick={handleEnrollClick} className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Start Learning Today
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Courses
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center animate-fade-in">
              <stat.icon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Explore Our Courses</h2>
          <p className="text-xl text-gray-600 mb-8">Find the perfect course to advance your education</p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for courses, subjects, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
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
                <CardTitle className="text-xl text-gray-800">{course.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  by {course.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{course.description}</p>
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

        <div className="text-center mt-12">
          <Button onClick={() => window.location.href = "/courses"} size="lg" variant="outline" className="text-lg px-8 py-3">
            <BookOpen className="mr-2 h-5 w-5" />
            View All Courses
          </Button>
        </div>
      </section>

      <section className="bg-white/60 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose EthioLearn?</h2>
            <p className="text-xl text-gray-600">Designed specifically for Ethiopian students and educators</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Self-Paced Learning</h3>
              <p className="text-gray-600">Learn at your own speed with flexible scheduling that fits your lifestyle.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Support</h3>
              <p className="text-gray-600">Connect with fellow students and experienced teachers in our discussion forums.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Certificates</h3>
              <p className="text-gray-600">Earn recognized certificates upon completion to advance your career.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold">EthioLearn</h3>
              </div>
              <p className="text-gray-300">Empowering Ethiopian students through accessible, quality education.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400">Mathematics</a></li>
                <li><a href="#" className="hover:text-emerald-400">Science</a></li>
                <li><a href="#" className="hover:text-emerald-400">Languages</a></li>
                <li><a href="#" className="hover:text-emerald-400">History</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald-400">Community</a></li>
                <li><a href="#" className="hover:text-emerald-400">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald-400">Facebook</a></li>
                <li><a href="#" className="hover:text-emerald-400">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-400">Instagram</a></li>
                <li><a href="#" className="hover:text-emerald-400">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 EthioLearn. All rights reserved. Built with ❤️ for Ethiopian education.</p>
          </div>
        </div>
      </footer>

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

export default Index;
