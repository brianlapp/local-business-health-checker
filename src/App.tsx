import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { MobileNavigation } from '@/components/MobileNavigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Index } from '@/pages/Index';
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { AddBusiness } from '@/pages/AddBusiness';
import { MapScanner } from '@/pages/MapScanner';
import { JobBoard } from '@/pages/JobBoard';
import { Opportunities } from '@/pages/Opportunities';
import { Profile } from '@/pages/Profile';
import { NotFound } from '@/pages/NotFound';
import AgencyAnalysis from '@/pages/AgencyAnalysis';

const App = () => {
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      await checkAuth();
      setLoading(false);
    };

    authenticate();
  }, [checkAuth]);
  
  return (
    <div className="min-h-screen">
      <Router>
        <Toaster />
        <Header />

        <div className="pt-16 min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MobileNavigation />
      </Router>
    </div>
  );
};

export default App;
