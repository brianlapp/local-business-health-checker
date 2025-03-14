
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface OpportunityEmptyStateProps {
  onAddClick: () => void;
}

const OpportunityEmptyState: React.FC<OpportunityEmptyStateProps> = ({ 
  onAddClick 
}) => {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-medium text-gray-600 mb-2">No opportunities yet</h3>
      <p className="text-gray-500 mb-4">
        Start by adding job opportunities, client leads, or freelance projects.
      </p>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" /> Add Your First Opportunity
      </Button>
    </div>
  );
};

export default OpportunityEmptyState;
