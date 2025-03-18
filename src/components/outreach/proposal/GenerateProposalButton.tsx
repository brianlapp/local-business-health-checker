
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { generateProposal } from '@/services/outreach/proposalService';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';

interface GenerateProposalButtonProps {
  selectedTarget: Business | Opportunity | null;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  selectedTemplateId: string;
  onProposalGenerated: (proposal: string) => void;
}

export const GenerateProposalButton: React.FC<GenerateProposalButtonProps> = ({
  selectedTarget,
  isGenerating,
  setIsGenerating,
  selectedTemplateId,
  onProposalGenerated
}) => {
  const handleGenerateProposal = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target business or opportunity first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const proposal = await generateProposal(selectedTarget, selectedTemplateId || undefined);
      onProposalGenerated(proposal);
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      disabled={!selectedTarget || isGenerating} 
      onClick={handleGenerateProposal}
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Generate Proposal
        </>
      )}
    </Button>
  );
};
