
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import MapScanner from './pages/MapScanner';
import AddBusiness from './pages/AddBusiness';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/map-scanner" element={<MapScanner />} />
        <Route path="/add-business" element={<AddBusiness />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
