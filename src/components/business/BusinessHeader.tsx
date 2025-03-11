
import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Business } from '@/types/business';

interface BusinessHeaderProps {
  business: Business;
  onClick: () => void;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ business, onClick }) => {
  return (
    <div className="flex-1" onClick={onClick}>
      <h3 className="font-semibold text-lg">{business.name}</h3>
      <div className="flex items-center text-muted-foreground text-sm">
        <a 
          href={`https://${business.website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {business.website}
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default BusinessHeader;
