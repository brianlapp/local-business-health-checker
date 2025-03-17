
import React from 'react';
import { Business } from '@/types/business';
import { ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScanResultItemProps {
  business: Business;
  isSelected?: boolean;
  onSelect?: (business: Business) => void;
}

const ScanResultItem: React.FC<ScanResultItemProps> = ({
  business,
  isSelected = false,
  onSelect
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(business);
    }
  };
  
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    if (score >= 60) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
  };
  
  return (
    <div 
      className={cn(
        "flex justify-between items-center p-3 rounded-lg transition-colors",
        isSelected 
          ? "bg-primary/10 border border-primary/20" 
          : "bg-secondary/50 hover:bg-secondary",
        onSelect && "cursor-pointer"
      )}
      onClick={handleClick}
    >
      <div className="overflow-hidden">
        <div className="font-medium truncate">{business.name}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {business.website && (
            <a 
              href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{business.website}</span>
            </a>
          )}
          {!business.website && <span className="text-muted-foreground italic">No website</span>}
        </div>
        {business.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{business.location}</span>
          </div>
        )}
      </div>
      <div className={cn(
        "text-sm font-bold px-2 py-1 rounded ml-2",
        getScoreColor(business.score)
      )}>
        {business.score}
      </div>
    </div>
  );
};

export default ScanResultItem;
