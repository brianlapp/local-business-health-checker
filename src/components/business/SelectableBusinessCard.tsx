
import React from 'react';
import { Business } from '@/types/business';
import { Checkbox } from '@/components/ui/checkbox';
import BusinessCard from '../BusinessCard';

interface SelectableBusinessCardProps {
  business: Business;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isHighlighted?: boolean;
  onUpdate?: (updatedBusinesses: Business[]) => void;
  className?: string;
}

const SelectableBusinessCard: React.FC<SelectableBusinessCardProps> = ({
  business,
  isSelected,
  onSelect,
  isHighlighted = false,
  onUpdate,
  className = ''
}) => {
  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(business.id);
  };
  
  return (
    <div 
      className={`relative ${
        isHighlighted ? 'ring-2 ring-green-500 rounded-xl' : ''
      } ${className}`}
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
      
      <div className="pl-8 h-full">
        <BusinessCard 
          business={business} 
          onUpdate={onUpdate}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default SelectableBusinessCard;
