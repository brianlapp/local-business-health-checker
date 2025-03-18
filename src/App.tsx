
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AddBusiness from '@/pages/AddBusiness';
import MapScanner from '@/pages/MapScanner';
import JobBoard from '@/pages/JobBoard';
import Opportunities from '@/pages/Opportunities';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import AgencyAnalysis from '@/pages/AgencyAnalysis';
import ScanManager from '@/pages/ScanManager';
import OutreachManager from '@/pages/OutreachManager';

const App = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        // Auth check handled by useAuth hook
      } catch (error) {
        console.error('App: Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, [user]);
  
  // Add an early return with loading indicator to prevent white screen
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Router>
        <Toaster />
        <Header />

        <div className="pt-16 min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/add-business"
              element={
                <ProtectedRoute>
                  <AddBusiness />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/map-scanner"
              element={
                <ProtectedRoute>
                  <MapScanner />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/job-board"
              element={
                <ProtectedRoute>
                  <JobBoard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobBoard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute>
                  <Opportunities />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/agency-analysis"
              element={
                <ProtectedRoute>
                  <AgencyAnalysis />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/scan-manager" 
              element={
                <ProtectedRoute>
                  <ScanManager />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/outreach" 
              element={
                <ProtectedRoute>
                  <OutreachManager />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {user && <MobileNavigation />}
      </Router>
    </div>
  );
};

export default App;
