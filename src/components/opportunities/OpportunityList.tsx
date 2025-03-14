
import React from 'react';
import { Opportunity } from '@/types/opportunity';
import OpportunityCard from '@/components/opportunities/OpportunityCard';

interface OpportunityListProps {
  opportunities: Opportunity[];
  onUpdate: () => void;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ 
  opportunities, 
  onUpdate 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default OpportunityList;
