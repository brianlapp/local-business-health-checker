
import React from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import BusinessCard from '../BusinessCard';

interface DashboardListProps {
  businesses: Business[];
  loading: boolean;
  viewMode: 'grid' | 'list';
}

const DashboardList: React.FC<DashboardListProps> = ({ 
  businesses, 
  loading, 
  viewMode 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No businesses found</h3>
        <p className="text-muted-foreground mt-2">Try scanning a new area or adding businesses manually</p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
    )}>
      {businesses.map((business) => (
        <BusinessCard 
          key={business.id} 
          business={business}
          className="animate-slide-up"
        />
      ))}
    </div>
  );
};

export default DashboardList;
