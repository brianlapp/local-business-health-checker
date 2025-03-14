
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email || 'User'}! Here's an overview of your activities.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Opportunities</h3>
          <p className="text-muted-foreground">Track and manage your client opportunities.</p>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Active opportunities</div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Job Board</h3>
          <p className="text-muted-foreground">Find and save new job postings.</p>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Saved jobs</div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Map Scanner</h3>
          <p className="text-muted-foreground">Discover local business opportunities.</p>
          <div className="mt-4">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Local businesses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
