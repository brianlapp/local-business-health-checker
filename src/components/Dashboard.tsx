
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { getBusinesses } from '@/services/businessService';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import DashboardControls from './dashboard/DashboardControls';
import DashboardList from './dashboard/DashboardList';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      const data = await getBusinesses();
      setBusinesses(data);
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
    } else if (sortBy === 'name') {
      return sortOrder === 'desc' 
        ? b.name.localeCompare(a.name) 
        : a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      const dateA = a.lastChecked ? new Date(a.lastChecked) : new Date(0);
      const dateB = b.lastChecked ? new Date(b.lastChecked) : new Date(0);
      return sortOrder === 'desc' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  return (
    <div className={cn('container py-8', className)}>
      <DashboardHeader 
        setBusinesses={setBusinesses} 
        setLoading={setLoading} 
        loading={loading} 
      />
      
      <DashboardStats businesses={businesses} />
      
      <DashboardControls 
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        toggleSortOrder={toggleSortOrder}
      />
      
      <DashboardList 
        businesses={sortedBusinesses} 
        loading={loading} 
        viewMode={viewMode} 
      />
    </div>
  );
};

export default Dashboard;
