
import React from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import BusinessCard from '../BusinessCard';
import { Checkbox } from '@/components/ui/checkbox';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';

interface DashboardListProps {
  businesses: Business[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onBusinessUpdate?: (businesses: Business[]) => void;
  selectedBusinesses?: string[];
  setSelectedBusinesses?: React.Dispatch<React.SetStateAction<string[]>>;
  highlightedBusinesses?: string[];
}

const DashboardList: React.FC<DashboardListProps> = ({ 
  businesses, 
  loading, 
  viewMode,
  onBusinessUpdate,
  selectedBusinesses: externalSelectedBusinesses,
  setSelectedBusinesses: externalSetSelectedBusinesses,
  highlightedBusinesses: externalHighlightedBusinesses
}) => {
  const {
    selectedBusinesses: internalSelectedBusinesses,
    handleSelectBusiness: internalHandleSelectBusiness,
  } = useBusinessSelection();

  // Use either external or internal state
  const selectedBusinesses = externalSelectedBusinesses || internalSelectedBusinesses;
  const handleSelectBusiness = (id: string) => {
    if (externalSetSelectedBusinesses) {
      externalSetSelectedBusinesses(prev => {
        if (prev.includes(id)) {
          return prev.filter(businessId => businessId !== id);
        } else {
          return [...prev, id];
        }
      });
    } else {
      internalHandleSelectBusiness(id);
    }
  };
  
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
      {businesses.map((business) => {
        const isSelected = selectedBusinesses.includes(business.id);
        const isHighlighted = externalHighlightedBusinesses?.includes(business.id);
        
        return (
          <div key={business.id} className={cn(
            "relative group",
            isHighlighted && "animate-pulse"
          )}>
            {(externalSetSelectedBusinesses || internalHandleSelectBusiness) && (
              <div className="absolute top-4 left-4 z-10">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => handleSelectBusiness(business.id)}
                  className={cn(
                    "transition-opacity",
                    selectedBusinesses.length > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                />
              </div>
            )}
            
            <BusinessCard 
              business={business}
              className={cn(
                "animate-slide-up transition-all",
                isHighlighted && "border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/20",
                isSelected && "border-primary"
              )}
              onUpdate={onBusinessUpdate}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DashboardList;
