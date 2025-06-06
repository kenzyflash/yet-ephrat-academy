
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-emerald-400" />
              <h3 className="text-2xl font-bold">SafHub</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering Ethiopian students with quality education and modern learning tools for a brighter future.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/courses" className="text-gray-300 hover:text-emerald-400 transition-colors">Courses</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Popular Courses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-gray-300 hover:text-emerald-400 transition-colors">Mathematics</Link></li>
              <li><Link to="/courses" className="text-gray-300 hover:text-emerald-400 transition-colors">Science</Link></li>
              <li><Link to="/courses" className="text-gray-300 hover:text-emerald-400 transition-colors">English</Link></li>
              <li><Link to="/courses" className="text-gray-300 hover:text-emerald-400 transition-colors">Social Studies</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300">Education Center, Addis Ababa</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300">+251 (911) 123-456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300">info@safhub.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} SafHub. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
