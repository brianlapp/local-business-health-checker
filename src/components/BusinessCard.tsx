
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Business } from '@/types/business';
import ScoreDisplay from './ScoreDisplay';
import { Button } from '@/components/ui/button';
import { getBusinesses } from '@/services/businessService';
import BusinessHeader from './business/BusinessHeader';
import ScoreBadge from './business/ScoreBadge';
import CardActions from './business/CardActions';

interface BusinessCardProps {
  business: Business;
  className?: string;
  onUpdate?: (updatedBusinesses: Business[]) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, className, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
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
  
  const toggleExpanded = () => setExpanded(!expanded);
  
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
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-5 pb-5 animate-slide-up">
          <div className="pt-4 border-t">
            <ScoreDisplay 
              score={business.score} 
              business={business} 
              onScanComplete={handleScanComplete}
            />
            
            <CardActions business={business} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCard;
