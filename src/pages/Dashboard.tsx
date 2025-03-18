
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email || 'User'}! Here's an overview of your opportunities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Getting Started</h2>
            <p>
              This is your dashboard where you'll see an overview of your freelance opportunities.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
