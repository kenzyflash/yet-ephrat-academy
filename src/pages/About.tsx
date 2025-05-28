
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, Heart, Target, Eye, Globe } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Alemayehu Tadesse",
      role: "Founder & CEO",
      description: "Former university professor with 15+ years in education",
      image: "/placeholder.svg"
    },
    {
      name: "Meron Asefa",
      role: "Head of Curriculum",
      description: "Mathematics expert and curriculum development specialist",
      image: "/placeholder.svg"
    },
    {
      name: "Sarah Johnson",
      role: "Language Programs Director",
      description: "International educator specializing in language learning",
      image: "/placeholder.svg"
    },
    {
      name: "Dawit Bekele",
      role: "Technology Director",
      description: "Software engineer passionate about educational technology",
      image: "/placeholder.svg"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Accessibility",
      description: "Quality education should be accessible to every Ethiopian student, regardless of location or background."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We maintain the highest standards in our course content and teaching methodologies."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive learning community where students and teachers collaborate."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "Leveraging technology to create engaging and effective learning experiences."
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About EthioLearn
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform education in Ethiopia by making quality learning 
            accessible to every student through innovative online platforms and expert instruction.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to quality education across Ethiopia by providing 
                comprehensive online learning platforms that cater to diverse learning styles 
                and academic needs, empowering students to achieve their full potential.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To become Ethiopia's leading educational platform, fostering a generation of 
                knowledgeable, skilled, and confident learners who will drive the country's 
                development and compete globally in the knowledge economy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <section className="mb-16">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-gray-800 text-center mb-4">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="max-w-4xl mx-auto">
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  EthioLearn was founded in 2023 by a group of Ethiopian educators and technologists 
                  who recognized the urgent need for accessible, high-quality education in Ethiopia. 
                  Having witnessed firsthand the challenges students face in accessing quality education—whether 
                  due to geographic barriers, limited resources, or inadequate infrastructure—our founders 
                  set out to create a solution.
                </p>
                <p>
                  Starting with just a handful of courses in mathematics and Ethiopian history, we've grown 
                  into a comprehensive learning platform serving thousands of students across the country. 
                  Our team combines deep expertise in Ethiopian curricula with cutting-edge educational 
                  technology to deliver learning experiences that are both culturally relevant and globally competitive.
                </p>
                <p>
                  Today, EthioLearn offers over 500 courses spanning multiple subjects and grade levels, 
                  all designed by Ethiopian educators who understand the unique needs and contexts of our students. 
                  We're proud to be part of Ethiopia's educational transformation and committed to continuing 
                  this journey until every Ethiopian student has access to world-class education.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              Passionate educators and technologists working to transform Ethiopian education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm text-center">
                <CardHeader>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <CardTitle className="text-lg text-gray-800">{member.name}</CardTitle>
                  <CardDescription className="text-emerald-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Be part of Ethiopia's educational revolution. Whether you're a student ready to learn 
                or an educator wanting to teach, we welcome you to our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/courses"}
                  className="bg-white text-emerald-600 hover:bg-gray-100"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Courses
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = "/contact"}
                  className="border-white text-white hover:bg-white hover:text-emerald-600"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Get in Touch
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </div>
  );
};

export default About;
