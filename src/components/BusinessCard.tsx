
import React from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { getBusinesses } from '@/services/businessService';
import BusinessHeader from './business/BusinessHeader';
import ScoreBadge from './business/ScoreBadge';
import ExpandableContent from './business/ExpandableContent';
import ToggleExpandButton from './business/ToggleExpandButton';
import { useExpand } from '@/hooks/useExpand';

interface BusinessCardProps {
  business: Business;
  className?: string;
  onUpdate?: (updatedBusinesses: Business[]) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, className, onUpdate }) => {
  const { expanded, toggleExpanded, handleToggleButtonClick } = useExpand(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleScanComplete = async () => {
    try {
      setIsRefreshing(true);
      const updatedBusinesses = await getBusinesses();
      if (onUpdate) {
        onUpdate(updatedBusinesses);
      }
    } catch (error) {
      console.error('Error refreshing businesses:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div 
      className={cn(
        'border rounded-xl overflow-hidden transition-all duration-300 ease-in-out animate-fade-in',
        'bg-white shadow-card hover:shadow-elevated',
        expanded ? 'shadow-elevated' : '',
        className
      )}
    >
      <div
        className="p-5 cursor-pointer flex items-center justify-between"
        onClick={toggleExpanded}
      >
        <BusinessHeader business={business} onClick={toggleExpanded} />
        
        <div className="flex items-center">
          <ScoreBadge score={business.score} />
          <ToggleExpandButton 
            expanded={expanded} 
            onClick={handleToggleButtonClick}
          />
        </div>
      </div>
      
      {expanded && <ExpandableContent business={business} onScanComplete={handleScanComplete} />}
    </div>
  );
};

export default BusinessCard;
