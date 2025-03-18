
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Updated import path
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{error: Error | null}>;
  signUp: (email: string, password: string) => Promise<{error: Error | null, user: User | null}>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session on mount
    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        toast.success('Signed in successfully');
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        toast.success('Signed up successfully! Please check your email to confirm your account.');
      }
      
      return { error: null, user: data?.user || null };
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sign up');
      return { error: error as Error, user: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
