
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
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Clean up any existing auth state
  const cleanupAuthState = () => {
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Determine the correct dashboard based on role
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

  // Fetch user role from the database with improved error handling
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('Fetching role for user:', userId);
      
      // Use maybeSingle() to handle cases where no role exists
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        
        // Check if it's a permission error due to RLS
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.log('Permission denied for role fetch, defaulting to student');
          setUserRole('student');
          return 'student';
        }
        
        // For other errors, also default to student
        console.log('Role fetch failed, defaulting to student');
        setUserRole('student');
        return 'student';
      }

      const role = data?.role || 'student';
      console.log('User role:', role);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('student');
      return 'student';
    }
  };

  // Handle redirection based on role and current location
  const handleRedirection = (role: string) => {
    const currentPath = window.location.pathname;
    const targetPath = getDashboardPath(role);
    
    console.log('Current path:', currentPath, 'Target path:', targetPath, 'Role:', role);
    
    // Prevent redirection loops - only redirect if we're not already on the correct page
    if (currentPath !== targetPath) {
      // If we're on the home page and authenticated, redirect to dashboard
      if (currentPath === '/') {
        console.log('Redirecting from home to dashboard');
        setTimeout(() => {
          window.location.href = targetPath;
        }, 100);
        return;
      }
      
      // If we're on a dashboard but it's the wrong one for our role
      if (currentPath.includes('-dashboard')) {
        console.log('Redirecting to correct dashboard');
        setTimeout(() => {
          window.location.href = targetPath;
        }, 100);
        return;
      }
    }
  };

  // Refresh user role and handle redirection
  const refreshUserRole = async () => {
    if (user) {
      const role = await fetchUserRole(user.id);
      // Only redirect if we're on the home page or wrong dashboard
      const currentPath = window.location.pathname;
      if (currentPath === '/' || (currentPath.includes('-dashboard') && currentPath !== getDashboardPath(role))) {
        handleRedirection(role);
      }
    }
  };

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (currentSession?.user && mounted) {
          console.log('Found existing session for:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Fetch role but don't redirect during initial load
          await fetchUserRole(currentSession.user.id);
        }
        
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && initialized) {
          // For sign in events after initialization, fetch role and redirect
          if (event === 'SIGNED_IN') {
            const role = await fetchUserRole(session.user.id);
            handleRedirection(role);
          } else {
            // For other events, just fetch the role without redirecting
            await fetchUserRole(session.user.id);
          }
        }
        
        setLoading(false);
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      cleanupAuthState();
      
      // Enhanced role determination with validation
      let role: 'student' | 'teacher' | 'admin' = 'student';
      
      // Check email patterns more strictly
      if (email.toLowerCase().includes('admin@') || userData.role === 'admin') {
        role = 'admin';
      } else if (email.toLowerCase().includes('teacher@') || userData.role === 'teacher') {
        role = 'teacher';
      }

      // Validate required fields
      if (!userData.first_name?.trim() || !userData.last_name?.trim()) {
        throw new Error('First name and last name are required');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name.trim(),
            last_name: userData.last_name.trim(),
            school: userData.school?.trim() || '',
            grade: userData.grade?.trim() || '',
            role: role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = error.message;
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try signing in instead.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('Email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      if (!email?.trim() || !password?.trim()) {
        throw new Error('Email and password are required');
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = error.message;
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out...');
      
      setUserRole(null);
      setUser(null);
      setSession(null);
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && 
          !error.message.includes('session_not_found') && 
          !error.message.includes('Auth session missing')) {
        throw error;
      }

      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to home page
      window.location.href = "/";
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, clear the state and redirect
      setUserRole(null);
      setUser(null);
      setSession(null);
      cleanupAuthState();
      
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
      
      window.location.href = "/";
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
