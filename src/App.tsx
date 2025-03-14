
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Public route */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
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
          
          <Route path="/opportunities" element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
