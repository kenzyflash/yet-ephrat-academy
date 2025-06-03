
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRole, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    // Only handle redirects if we're not loading and have completed auth check
    if (!loading) {
      if (!user) {
        // Redirect to home if not authenticated
        console.log('User not authenticated, redirecting to home');
        window.location.href = '/';
        return;
      }

      // Check role requirements after user and role are loaded
      if (user && userRole) {
        if (requiredRole && userRole !== requiredRole) {
          // Redirect to correct dashboard if wrong role
          const correctPath = userRole === 'admin' ? '/admin-dashboard' 
                            : userRole === 'teacher' ? '/teacher-dashboard' 
                            : '/student-dashboard';
          console.log('Wrong role, redirecting to:', correctPath);
          window.location.href = correctPath;
          return;
        }
        
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          // Redirect if role not in allowed roles
          const correctPath = userRole === 'admin' ? '/admin-dashboard' 
                            : userRole === 'teacher' ? '/teacher-dashboard' 
                            : '/student-dashboard';
          console.log('Role not allowed, redirecting to:', correctPath);
          window.location.href = correctPath;
          return;
        }
      }
    }
  }, [user, userRole, loading, requiredRole, allowedRoles]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  // Don't render if we're waiting for role to be loaded
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
