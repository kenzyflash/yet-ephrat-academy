
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
    if (!loading && !user) {
      // Redirect to home if not authenticated
      window.location.href = '/';
    } else if (!loading && user && requiredRole && userRole !== requiredRole) {
      // Redirect to correct dashboard if wrong role
      const correctPath = userRole === 'admin' ? '/admin-dashboard' 
                        : userRole === 'teacher' ? '/teacher-dashboard' 
                        : '/student-dashboard';
      window.location.href = correctPath;
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(userRole || '')) {
      // Redirect if role not in allowed roles
      const correctPath = userRole === 'admin' ? '/admin-dashboard' 
                        : userRole === 'teacher' ? '/teacher-dashboard' 
                        : '/student-dashboard';
      window.location.href = correctPath;
    }
  }, [user, userRole, loading, requiredRole, allowedRoles]);

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

  if (!user) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
