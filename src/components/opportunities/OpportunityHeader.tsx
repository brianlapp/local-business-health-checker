
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface OpportunityHeaderProps {
  onAddClick?: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({ 
  onAddClick,
  title = "Opportunities",
  description,
  children
}) => {
  return (
    <div className="flex flex-col space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {children ? (
          children
        ) : onAddClick ? (
          <Button onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Opportunity
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default OpportunityHeader;
