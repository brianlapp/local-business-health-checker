
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Toaster } from 'sonner';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f8fa]">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
