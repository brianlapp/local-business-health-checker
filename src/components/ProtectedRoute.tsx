
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  console.log('[PROTECTED] ProtectedRoute component rendered');
  
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED] ProtectedRoute state:', { 
    isLoading, 
    isAuthenticated: !!user,
    pathname: location.pathname
  });

  if (isLoading) {
    console.log('[PROTECTED] Showing loading state');
    return (
      <div className="flex justify-center items-center h-screen">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED] Not authenticated, redirecting to auth');
    return <Navigate to="/auth" state={{ returnUrl: location.pathname }} replace />;
  }

  console.log('[PROTECTED] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
