
import React, { useState } from 'react';
import { Business } from '@/types/business';
import { Checkbox } from '@/components/ui/checkbox';
import BusinessCard from '../BusinessCard';

interface BusinessListItemProps {
  business: Business;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isHighlighted?: boolean;
  onUpdate?: (updatedBusinesses: Business[]) => void;
  viewMode: 'grid' | 'list';
}

const BusinessListItem: React.FC<BusinessListItemProps> = ({
  business,
  isSelected,
  onSelect,
  isHighlighted = false,
  onUpdate,
  viewMode
}) => {
  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(business.id);
  };
  
  return (
    <div 
      className={`relative ${
        viewMode === 'list' ? 'mb-4' : 'mb-0'
      } ${isHighlighted ? 'ring-2 ring-green-500 rounded-xl' : ''}`}
    >
      <div 
        className="absolute left-3 top-5 z-10"
        onClick={handleCheckboxChange}
      >
        <Checkbox 
          checked={isSelected} 
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>
      
      <div className={`pl-8 ${viewMode === 'list' ? '' : 'h-full'}`}>
        <BusinessCard 
          business={business} 
          onUpdate={onUpdate}
          className={viewMode === 'grid' ? 'h-full' : ''}
        />
      </div>
    </div>
  );
};

export default BusinessListItem;
