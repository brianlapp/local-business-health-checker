
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface OpportunityFormSubmitProps {
  isSubmitting: boolean;
  isEditing: boolean;
}

const OpportunityFormSubmit: React.FC<OpportunityFormSubmitProps> = ({ 
  isSubmitting,
  isEditing 
}) => {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          isEditing ? 'Update Opportunity' : 'Create Opportunity'
        )}
      </Button>
    </div>
  );
};

export default OpportunityFormSubmit;
