
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/Header';

const Index = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index page mounted');
    console.log('User state:', user);
    console.log('Loading state:', isLoading);
  }, [user, isLoading]);

  // Show a loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated and not loading, show a welcome screen with link to auth
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Freelance Opportunity Finder
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover and manage potential clients across multiple channels
          </p>
          <a 
            href="/auth" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-lg font-medium text-white shadow hover:bg-primary/90"
          >
            Get Started
          </a>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
