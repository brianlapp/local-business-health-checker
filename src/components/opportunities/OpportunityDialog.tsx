
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Opportunity } from '@/types/opportunity';
import { useAuth } from '@/contexts/AuthContext';
import { useOpportunityForm } from '@/hooks/useOpportunityForm';

// Import form sections
import OpportunityBasicSection from './form/OpportunityBasicSection';
import OpportunityClientSection from './form/OpportunityClientSection';
import OpportunityBudgetSection from './form/OpportunityBudgetSection';
import OpportunityMiscSection from './form/OpportunityMiscSection';
import OpportunityFormSubmit from './form/OpportunityFormSubmit';

interface OpportunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: Opportunity;
  onSuccess: () => void;
}

const OpportunityDialog: React.FC<OpportunityDialogProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { 
    isEditing, 
    isSubmitting, 
    formValues, 
    handleSubmit 
  } = useOpportunityForm(opportunity, user?.id, onSuccess);

  // Type assertion for setSource to align with the expected type
  const setSourceTyped = (value: "job_board" | "recruiting_agency" | "direct_client" | "other") => {
    formValues.setSource(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Opportunity' : 'Add Opportunity'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <OpportunityBasicSection 
              title={formValues.title}
              setTitle={formValues.setTitle}
              description={formValues.description}
              setDescription={formValues.setDescription}
              source={formValues.source}
              setSource={setSourceTyped}
              sourceUrl={formValues.sourceUrl}
              setSourceUrl={formValues.setSourceUrl}
              status={formValues.status}
              setStatus={formValues.setStatus}
            />
            
            {/* Client Information */}
            <OpportunityClientSection 
              clientName={formValues.clientName}
              setClientName={formValues.setClientName}
              clientWebsite={formValues.clientWebsite}
              setClientWebsite={formValues.setClientWebsite}
              location={formValues.location}
              setLocation={formValues.setLocation}
              isRemote={formValues.isRemote}
              setIsRemote={formValues.setIsRemote}
            />
            
            {/* Budget Information */}
            <OpportunityBudgetSection 
              budgetMin={formValues.budgetMin}
              setBudgetMin={formValues.setBudgetMin}
              budgetMax={formValues.budgetMax}
              setBudgetMax={formValues.setBudgetMax}
              currency={formValues.currency}
              setCurrency={formValues.setCurrency}
            />
            
            {/* Additional Information */}
            <OpportunityMiscSection 
              skills={formValues.skills}
              setSkills={formValues.setSkills}
              isPriority={formValues.isPriority}
              setIsPriority={formValues.setIsPriority}
            />
          </div>
          
          <OpportunityFormSubmit 
            isSubmitting={isSubmitting} 
            isEditing={isEditing} 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDialog;
