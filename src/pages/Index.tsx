import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Star, 
  Play, 
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import CourseSearch from "@/components/CourseSearch";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();

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

  const stats = [
    { icon: Users, label: "Active Students", value: "10,000+" },
    { icon: BookOpen, label: "Courses Available", value: "500+" },
    { icon: GraduationCap, label: "Expert Instructors", value: "200+" },
    { icon: Star, label: "Student Rating", value: "4.9/5" }
  ];

  const features = [
    {
      icon: Globe,
      title: "Ethiopian-Focused Content",
      description: "Curriculum designed specifically for Ethiopian students with local context and examples."
    },
    {
      icon: Zap,
      title: "Interactive Learning",
      description: "Engaging multimedia content, quizzes, and hands-on projects to enhance understanding."
    },
    {
      icon: Heart,
      title: "Community Support",
      description: "Connect with fellow students and teachers in a supportive learning environment."
    }
  ];

  const testimonials = [
    {
      name: "Meron Tadesse",
      role: "High School Student",
      content: "EthioLearn helped me improve my grades significantly. The teachers are amazing!",
      rating: 5
    },
    {
      name: "Dr. Alemayehu Bekele",
      role: "University Professor",
      content: "As an instructor, I love how engaged students become with this platform.",
      rating: 5
    },
    {
      name: "Sara Ahmed",
      role: "Adult Learner",
      content: "I can finally pursue my education while managing my family responsibilities.",
      rating: 5
    }
  ];

  const featuredCourses = [
    {
      id: 1,
      title: "Ethiopian History and Culture",
      instructor: "Dr. Alemayehu Tadesse",
      students: 1234,
      rating: 4.8,
      price: "Free",
      image: "/placeholder.svg",
      level: "Beginner"
    },
    {
      id: 2,
      title: "Mathematics for High School",
      instructor: "Prof. Meron Asefa",
      students: 2156,
      rating: 4.9,
      price: "500 ETB",
      image: "/placeholder.svg",
      level: "Intermediate"
    },
    {
      id: 3,
      title: "English Language Mastery",
      instructor: "Teacher Sarah Johnson",
      students: 3421,
      rating: 4.7,
      price: "300 ETB",
      image: "/placeholder.svg",
      level: "All Levels"
    }
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
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-emerald-600 font-medium">Home</a>
            <a href="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors">Courses</a>
            <a href="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</a>
            <a href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => window.location.href = "/student-dashboard"} className="bg-emerald-600 hover:bg-emerald-700">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setShowLogin(true)}>
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
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Learn, Grow, and Succeed with
            <span className="text-emerald-600"> EthioLearn</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of Ethiopian students in our interactive online learning platform. 
            Master new skills, advance your career, and achieve your educational goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleEnrollClick}
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-3"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <stat.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose EthioLearn?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best learning experience tailored for Ethiopian students.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular courses designed by expert Ethiopian educators.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()} students
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </span>
                </div>
                <Button onClick={handleEnrollClick} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Play className="mr-2 h-4 w-4" />
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => window.location.href = "/courses"}>
            View All Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Explore Our Courses Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search through our extensive catalog of courses to find the perfect fit for your learning goals.
          </p>
        </div>
        <CourseSearch />
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied learners who have transformed their lives through education.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-gray-600 italic">
                  "{testimonial.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join EthioLearn today and unlock your potential with our comprehensive online courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleEnrollClick}
              size="lg" 
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Start Learning Now
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-emerald-600 text-lg px-8 py-3">
              Learn More About Us
            </Button>
          </div>
        </div>
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
    </div>
  );
};

export default Index;
