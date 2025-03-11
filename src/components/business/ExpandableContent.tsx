
import React from 'react';
import { Business } from '@/types/business';
import ScoreDisplay from '../ScoreDisplay';
import CardActions from './CardActions';

interface ExpandableContentProps {
  business: Business;
  onScanComplete: () => Promise<void>;
  className?: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({ 
  business, 
  onScanComplete,
  className = ''
}) => {
  return (
    <div className={`px-5 pb-5 animate-slide-up ${className}`}>
      <div className="pt-4 border-t">
        <ScoreDisplay 
          score={business.score} 
          business={business} 
          onScanComplete={onScanComplete}
        />
        
        <CardActions business={business} />
      </div>
    </div>
  );
};

export default ExpandableContent;
