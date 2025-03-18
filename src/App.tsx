
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddBusiness from './pages/AddBusiness';
import Opportunities from './pages/Opportunities';
import JobBoard from './pages/JobBoard';
import MapScanner from './pages/MapScanner';
import AgencyAnalysis from './pages/AgencyAnalysis';
import AgencyRelationships from './pages/AgencyRelationships';
import ScanManager from './pages/ScanManager';
import OutreachManager from './pages/OutreachManager';

function App() {
  console.log('[APP] App component rendered');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Remove console.log statements from JSX */}
          <Route path="/" element={<Index />} />
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
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
            path="/opportunities" 
            element={
              <ProtectedRoute>
                <Opportunities />
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
            path="/map-scanner" 
            element={
              <ProtectedRoute>
                <MapScanner />
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
            path="/agency-relationships" 
            element={
              <ProtectedRoute>
                <AgencyRelationships />
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
            path="/outreach-manager" 
            element={
              <ProtectedRoute>
                <OutreachManager />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
