
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Business } from './SampleBusinessData';
import ScoreDisplay from './ScoreDisplay';
import { Button } from '@/components/ui/button';

interface BusinessCardProps {
  business: Business;
  className?: string;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, className }) => {
  const [expanded, setExpanded] = useState(false);
  
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
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
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
        
        <div className="flex items-center">
          <div className={cn(
            'text-2xl font-bold px-3 py-1 rounded-lg transition-colors',
            business.score >= 80 ? 'bg-red-50 text-red-500' : 
            business.score >= 60 ? 'bg-orange-50 text-orange-500' : 
            business.score >= 40 ? 'bg-yellow-50 text-yellow-500' : 
            'bg-green-50 text-green-500'
          )}>
            {business.score}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
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
            <ScoreDisplay score={business.score} business={business} />
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline">
                Review Website
              </Button>
              <Button>
                Generate Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCard;
