
import React, { useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import { Toaster } from 'sonner';

const Index = () => {
  useEffect(() => {
    console.log('Index page mounted');
    // This will help us track if the index page is rendering at all
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f8fa]">
      <main className="flex-1">
        <Dashboard />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
