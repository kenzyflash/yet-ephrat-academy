
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, Award, Heart, Globe, Target, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & CEO",
      description: "Safety technology pioneer with 15+ years in industrial safety training.",
      image: "/placeholder.svg"
    },
    {
      name: "Prof. Michael Chen",
      role: "Head of Curriculum",
      description: "Former safety director specializing in workplace safety and risk management.",
      image: "/placeholder.svg"
    },
    {
      name: "Jennifer Adams",
      role: "Chief Technology Officer",
      description: "Software engineer passionate about democratizing access to safety training.",
      image: "/placeholder.svg"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Safety-Centered",
      description: "Every decision we make puts safety professional success and workplace safety first."
    },
    {
      icon: Globe,
      title: "Accessible Training",
      description: "Breaking down barriers to quality safety training for all professionals worldwide."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Committed to delivering the highest quality safety training experiences."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building strong connections between safety professionals, trainers, and organizations."
    }
  ];

  const achievements = [
    { number: "10,000+", label: "Safety Professionals Trained" },
    { number: "500+", label: "Safety Courses Available" },
    { number: "200+", label: "Expert Instructors" },
    { number: "95%", label: "Training Satisfaction" }
  ];

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
            <a href="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors">Courses</a>
            <a href="/about" className="text-emerald-600 font-medium">About</a>
            <a href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            About SafHub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform safety training worldwide by making quality safety education 
            accessible, engaging, and professionally relevant for every safety professional.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{achievement.number}</div>
                <div className="text-gray-600">{achievement.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              SafHub was founded with a simple yet powerful vision: to democratize access to 
              quality safety training for professionals worldwide. We believe that every safety professional, 
              regardless of their location or background, deserves access to world-class safety training resources.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our platform combines cutting-edge technology with deep understanding of safety industry 
              needs, creating a training environment that is both modern and professionally authentic.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700">Industry-relevant curriculum</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700">Expert safety professionals</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700">Interactive learning technology</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <span className="text-gray-700">Affordable and accessible</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/placeholder.svg" 
              alt="Safety professionals learning"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Our Values
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            These core values guide everything we do and shape the way we serve our safety community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="text-center bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <value.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Passionate safety professionals and technologists working together to transform safety training.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <CardTitle className="text-xl text-gray-800">{member.name}</CardTitle>
                <CardDescription className="text-emerald-600 font-medium">
                  {member.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Safety Training Revolution
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of the movement to transform safety training worldwide. Start your safety learning journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = "/"}
              size="lg" 
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
            <Button 
              onClick={() => window.location.href = "/contact"}
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-emerald-600 text-lg px-8 py-3"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
