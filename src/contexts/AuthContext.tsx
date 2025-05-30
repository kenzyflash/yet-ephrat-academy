
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

  const fetchUserRole = async (userId: string, shouldRedirect: boolean = false) => {
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
      if (shouldRedirect) {
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
      setUserRole('student');
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id, false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
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
      
      if (session?.user) {
        // Don't redirect on initial session load
        fetchUserRole(session.user.id, false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      // Clear local state first
      setUserRole(null);
      setUser(null);
      setSession(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Don't throw error if session is already missing
      if (error && !error.message.includes('session_not_found') && !error.message.includes('Auth session missing')) {
        throw error;
      }

      // Navigate to home page
      window.location.href = "/";
      
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      // Still navigate to home even if there's an error
      window.location.href = "/";
      
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
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
