import React from 'react';
import { Business } from '@/types/business';
import BusinessListItem from '../business/BusinessListItem';
import SelectableBusinessCard from '../business/SelectableBusinessCard';

interface DashboardListProps {
  businesses: Business[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onBusinessUpdate?: (updatedBusinesses: Business[]) => void;
  selectedBusinesses: string[];
  setSelectedBusinesses: (ids: string[]) => void;
  onSelectBusiness: (id: string) => void;
  highlightedBusinesses: string[];
}

const DashboardList: React.FC<DashboardListProps> = ({
  businesses,
  loading,
  viewMode,
  onBusinessUpdate,
  selectedBusinesses,
  setSelectedBusinesses,
  onSelectBusiness,
  highlightedBusinesses
}) => {
  if (loading) {
    return <div className="text-center">Loading businesses...</div>;
  }

  if (!businesses.length) {
    return <div className="text-center">No businesses found.</div>;
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
      {businesses.map(business => (
        viewMode === 'list' ? (
          <BusinessListItem
            key={business.id}
            business={business}
            isSelected={selectedBusinesses.includes(business.id)}
            onSelect={onSelectBusiness}
            isHighlighted={highlightedBusinesses.includes(business.id)}
            onUpdate={onBusinessUpdate}
            viewMode={viewMode}
          />
        ) : (
          <SelectableBusinessCard
            key={business.id}
            business={business}
            isSelected={selectedBusinesses.includes(business.id)}
            onSelect={onSelectBusiness}
            isHighlighted={highlightedBusinesses.includes(business.id)}
            onUpdate={onBusinessUpdate}
            className="h-full"
          />
        )
      ))}
    </div>
  );
};

export default DashboardList;
