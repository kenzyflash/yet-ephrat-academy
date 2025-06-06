
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Phone, MapPin, Clock, MessageSquare, Users, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'new'
        });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours."
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: ["Education Center Building", "Addis Ababa, Ethiopia", "Near Meskel Square"],
      color: "text-emerald-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+251 (911) 123-456", "+251 (922) 789-012", "Mon-Fri: 8AM-6PM"],
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@safhub.com", "support@safhub.com", "admissions@safhub.com"],
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 4:00 PM", "Sunday: Closed"],
      color: "text-orange-600"
    }
  ];

  const faqItems = [
    {
      question: "How do I enroll in courses?",
      answer: "Simply create an account, browse our course catalog, and click 'Enroll' on any course that interests you."
    },
    {
      question: "Are courses aligned with Ethiopian curriculum?",
      answer: "Yes, all our courses are designed to align with the Ethiopian national curriculum and educational standards."
    },
    {
      question: "Can I access courses offline?",
      answer: "Some course materials can be downloaded for offline viewing. Check individual course details for availability."
    },
    {
      question: "How do I get help with technical issues?",
      answer: "Contact our technical support team through the contact form or email support@safhub.com."
    }
  ];

  const departments = [
    {
      name: "Student Admissions",
      email: "admissions@safhub.com",
      description: "Course enrollment and academic guidance"
    },
    {
      name: "Technical Support",
      email: "support@safhub.com",
      description: "Platform issues and technical assistance"
    },
    {
      name: "Academic Affairs",
      email: "academic@safhub.com",
      description: "Curriculum questions and course content"
    },
    {
      name: "General Inquiries",
      email: "info@safhub.com",
      description: "General questions and information"
    }
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
            <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors">Courses</Link>
            <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</Link>
            <Link to="/contact" className="text-emerald-600 font-medium">Contact</Link>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our educational programs? We're here to help you succeed in your learning journey.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <info.icon className={`h-12 w-12 mx-auto mb-4 ${info.color}`} />
                <CardTitle className="text-lg text-gray-800">{info.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-gray-600">{detail}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form and Departments */}
      <section className="bg-white/80 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What is this regarding?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us how we can help you..."
                        rows={5}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Departments */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Departments</h3>
                <p className="text-gray-600 mb-6">
                  Reach out to the right department for faster assistance
                </p>
              </div>
              
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-emerald-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{dept.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                          <a 
                            href={`mailto:${dept.email}`}
                            className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            {dept.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Quick answers to common questions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {faqItems.map((faq, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-start gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="bg-white/80 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our office in Addis Ababa</p>
          </div>
          
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive map coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Education Center, Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
