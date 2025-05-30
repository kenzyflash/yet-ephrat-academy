
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
  const [hasRedirected, setHasRedirected] = useState(false);
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
      
      // Only redirect once and only if explicitly requested (during login)
      if (shouldRedirect && !isSigningOut && !hasRedirected) {
        setHasRedirected(true);
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
          console.log(`Redirecting from ${currentPath} to ${targetPath}`);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setHasRedirected(false);
          return;
        }
        
        if (isSigningOut) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only redirect on SIGNED_IN event and reset redirect flag
          if (event === 'SIGNED_IN') {
            setHasRedirected(false);
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
      setHasRedirected(false); // Reset redirect flag before sign in
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
      setHasRedirected(false);
      
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
      setHasRedirected(false);
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
