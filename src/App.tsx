import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import MapScanner from './pages/MapScanner';
import AddBusiness from './pages/AddBusiness';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import JobBoard from './pages/JobBoard';
import Toaster from './components/Toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-background">
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/opportunities" element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            } />
            
            <Route path="/job-board" element={
              <ProtectedRoute>
                <JobBoard />
              </ProtectedRoute>
            } />
            
            <Route path="/map-scanner" element={
              <ProtectedRoute>
                <MapScanner />
              </ProtectedRoute>
            } />
            
            <Route path="/add-business" element={
              <ProtectedRoute>
                <AddBusiness />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
