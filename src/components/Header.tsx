import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationButton from "@/components/NotificationButton";

const Header = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-800">SafHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Courses
            </Link>
            <Link to="/forum" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Forum
            </Link>
            <Link to="/achievements" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Achievements
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationButton />
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button onClick={() => setShowRegister(true)}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                Home
              </Link>
              <Link to="/courses" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                Courses
              </Link>
              <Link to="/forum" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                Forum
              </Link>
              <Link to="/achievements" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                Achievements
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors py-2">
                Contact
              </Link>
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Button variant="ghost" onClick={() => setShowLogin(true)} className="justify-start">
                    Login
                  </Button>
                  <Button onClick={() => setShowRegister(true)} className="justify-start">
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
      <RegisterModal open={showRegister} onOpenChange={setShowRegister} />
    </header>
  );
};

export default Header;
