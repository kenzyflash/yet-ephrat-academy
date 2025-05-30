
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
  const { toast } = useToast();

  const cleanupAuthState = () => {
    // Clear all auth-related data from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage as well
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const fetchUserRole = async (userId: string, shouldRedirect: boolean = false) => {
    // Don't fetch role if we're in the process of signing out
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
      
      // Only redirect if explicitly requested (during login) and not already on correct dashboard
      if (shouldRedirect && !isSigningOut) {
        const currentPath = window.location.pathname;
        let targetPath = '';
        
        if (role === 'admin') {
          targetPath = '/admin-dashboard';
        } else if (role === 'teacher') {
          targetPath = '/teacher-dashboard';
        } else {
          targetPath = '/student-dashboard';
        }
        
        // Only redirect if not already on the correct dashboard
        if (currentPath !== targetPath) {
          setTimeout(() => {
            window.location.href = targetPath;
          }, 100);
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
      await fetchUserRole(user.id, false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle sign out events
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }
        
        // Don't process other events if we're signing out
        if (isSigningOut) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only redirect on SIGNED_IN event (actual login), not on session restoration
          const shouldRedirect = event === 'SIGNED_IN';
          setTimeout(() => {
            fetchUserRole(session.user.id, shouldRedirect);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !isSigningOut) {
        // Don't redirect on initial session load
        fetchUserRole(session.user.id, false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      
      // Set signing out flag to prevent role fetching
      setIsSigningOut(true);
      
      // Clear local state immediately
      setUserRole(null);
      setUser(null);
      setSession(null);
      
      // Clean up auth state from storage
      cleanupAuthState();
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      // Don't throw error for missing sessions - user is already signed out
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
      
      // Navigate to home page with a slight delay to ensure state is cleared
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Still clear state and navigate even if there's an error
      setUserRole(null);
      setUser(null);
      setSession(null);
      cleanupAuthState();
      
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
      
      // Navigate to home page
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
