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

  // Fetch or assign user role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No role found, let's assign one based on email
        console.log('No role found, assigning default role based on email');
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user?.email) {
          let defaultRole = 'student';
          if (userData.user.email.includes('admin')) {
            defaultRole = 'admin';
          } else if (userData.user.email.includes('teacher')) {
            defaultRole = 'teacher';
          }

          // Insert the role
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert([{ user_id: userId, role: defaultRole }]);

          if (insertError) {
            console.error('Error inserting user role:', insertError);
            setUserRole('student');
            return 'student';
          }

          console.log('Assigned role:', defaultRole);
          setUserRole(defaultRole);
          return defaultRole;
        }
      } else if (error) {
        console.error('Error fetching user role:', error);
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
    
    console.log('Current path:', currentPath, 'Target path:', targetPath);
    
    // If we're on the home page and authenticated, redirect to dashboard
    if (currentPath === '/' && role) {
      console.log('Redirecting from home to dashboard');
      window.location.href = targetPath;
      return;
    }
    
    // If we're on a dashboard but it's the wrong one for our role
    if (currentPath.includes('-dashboard') && currentPath !== targetPath) {
      console.log('Redirecting to correct dashboard');
      window.location.href = targetPath;
      return;
    }
  };

  // Refresh user role and handle redirection
  const refreshUserRole = async () => {
    if (user) {
      const role = await fetchUserRole(user.id);
      handleRedirection(role);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let mounted = true;

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
        
        if (session?.user) {
          // Fetch role and handle redirection for sign in events
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

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then((role) => {
          // Only redirect on initial load if we're on the home page
          if (window.location.pathname === '/') {
            handleRedirection(role);
          }
        });
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      cleanupAuthState();
      
      // Determine role based on email or explicit role
      let role = 'student';
      if (email.includes('admin') || userData.role === 'admin') {
        role = 'admin';
      } else if (email.includes('teacher') || userData.role === 'teacher') {
        role = 'teacher';
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
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
      cleanupAuthState();
      
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
