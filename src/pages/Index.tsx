
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

const Index = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index page mounted');
  }, []);

  // If user is authenticated, redirect to dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show a loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect to auth page (not login)
  return <Navigate to="/auth" replace />;
};

export default Index;
