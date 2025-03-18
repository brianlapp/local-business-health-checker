
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

// Create a default context value
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[AUTH] AuthProvider mounted');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AUTH] AuthProvider useEffect running');
    
    // Get session on mount
    const getSession = async () => {
      console.log('[AUTH] Starting getSession');
      setIsLoading(true);
      try {
        console.log('[AUTH] Getting session from Supabase');
        const { data, error } = await supabase.auth.getSession();
        
        console.log('[AUTH] Session response:', data);
        if (error) {
          console.error('[AUTH] Error getting session:', error);
        }
        
        if (data && data.session) {
          console.log('[AUTH] Session exists:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('[AUTH] No active session found');
        }
      } catch (error) {
        console.error('[AUTH] Exception getting session:', error);
      } finally {
        console.log('[AUTH] Setting isLoading to false after session check');
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AUTH] Auth state changed:', event);
        if (currentSession) {
          console.log('[AUTH] New session detected:', currentSession.user.id);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('[AUTH] Session cleared');
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      console.log('[AUTH] Cleaning up auth subscription');
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

  console.log('[AUTH] AuthProvider rendering with values:', { 
    userExists: !!user, 
    sessionExists: !!session, 
    isLoading 
  });

  return (
    <AuthContext.Provider value={value}>
      {console.log('[AUTH] Rendering AuthContext children')}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('[AUTH] useAuth must be used within an AuthProvider');
  }
  console.log('[AUTH] useAuth called, isLoading:', context.isLoading);
  return context;
};
