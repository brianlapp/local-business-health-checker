
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface OpportunityHeaderProps {
  onAddClick: () => void;
}

const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({ 
  onAddClick 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Opportunities</h1>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" /> Add Opportunity
      </Button>
    </div>
  );
};

export default OpportunityHeader;
