
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'student':
      default:
        return '/student-dashboard';
    }
  };

  const shouldRedirectToDashboard = (currentPath: string, role: string) => {
    const targetPath = getDashboardPath(role);
    
    // Don't redirect if we're already on the correct dashboard
    if (currentPath === targetPath) {
      return null;
    }
    
    // If we're on the home page and have a role, redirect to dashboard
    if (currentPath === '/' && role) {
      return targetPath;
    }
    
    // If we're on a dashboard but it's the wrong one for our role
    if (currentPath.includes('-dashboard') && currentPath !== targetPath) {
      return targetPath;
    }
    
    return null;
  };

  const performRedirect = (path: string) => {
    console.log(`Redirecting to: ${path}`);
    
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
    }
    
    // Set a new timeout for redirect
    const timeout = setTimeout(() => {
      window.location.href = path;
    }, 100);
    
    setRedirectTimeout(timeout);
  };

  const fetchUserRole = async (userId: string, shouldRedirect: boolean = false) => {
    if (isSigningOut) return;
    
    try {
      console.log('Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setUserRole('student');
        return;
      }

      const role = data?.role || 'student';
      console.log('Fetched role:', role);
      setUserRole(role);
      
      // Handle redirection logic
      if (shouldRedirect && !isSigningOut) {
        const currentPath = window.location.pathname;
        const redirectPath = shouldRedirectToDashboard(currentPath, role);
        
        if (redirectPath) {
          performRedirect(redirectPath);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      if (!isSigningOut) {
        setUserRole('student');
      }
    }
  };

  const refreshUserRole = async () => {
    if (user && !isSigningOut) {
      // Clear any existing redirects before refreshing
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }
      await fetchUserRole(user.id, true);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          // Clear any pending redirects
          if (redirectTimeout) {
            clearTimeout(redirectTimeout);
            setRedirectTimeout(null);
          }
          return;
        }
        
        if (isSigningOut) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only redirect on SIGNED_IN event or when explicitly refreshing role
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              fetchUserRole(session.user.id, true);
            }, 0);
          } else {
            // For other events like TOKEN_REFRESHED, just fetch role without redirect
            setTimeout(() => {
              fetchUserRole(session.user.id, false);
            }, 0);
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !isSigningOut) {
        // Check if we need to redirect based on current location
        const currentPath = window.location.pathname;
        const isOnHomePage = currentPath === '/';
        fetchUserRole(session.user.id, isOnHomePage);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      // Clear any pending redirects on cleanup
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [isSigningOut]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clear any existing redirects before signing in
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      setIsSigningOut(true);
      setUserRole(null);
      setUser(null);
      setSession(null);
      
      // Clear any pending redirects
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        setRedirectTimeout(null);
      }
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && 
          !error.message.includes('session_not_found') && 
          !error.message.includes('Auth session missing') &&
          !error.message.includes('session id') &&
          !error.message.includes("doesn't exist")) {
        throw error;
      }

      console.log('Sign out completed, navigating to home...');
      
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      setUserRole(null);
      setUser(null);
      setSession(null);
      cleanupAuthState();
      
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
      
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } finally {
      setIsSigningOut(false);
    }
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
