
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';

export async function generateProposal(
  target: Business | Opportunity,
  template?: string
): Promise<string> {
  console.log('Generating proposal for:', target);
  
  try {
    // Determine if we're dealing with a business or opportunity
    const isBusiness = 'name' in target && !('title' in target);
    const isOpportunity = 'title' in target;
    
    // Extract the name/title appropriately
    const targetName = isBusiness ? (target as Business).name : (target as Opportunity).title;
    
    // Generate a simple proposal (mock implementation)
    const proposal = `
# Proposal for ${targetName}

Dear ${isBusiness ? 'Team at ' + (target as Business).name : 'Hiring Manager'},

I am writing to express my interest in ${isOpportunity ? 'the ' + (target as Opportunity).title + ' position' : 'working with your business'}. 

[Your proposal content here]

Best regards,
[Your Name]
    `;
    
    return proposal;
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return 'Error generating proposal. Please try again.';
  }
}

export async function saveProposalTemplate(name: string, content: string): Promise<boolean> {
  // Implementation for saving proposal templates
  console.log('Saving proposal template:', name);
  
  try {
    // Mock implementation
    return true;
  } catch (error) {
    console.error('Error saving proposal template:', error);
    toast.error('Failed to save proposal template');
    return false;
  }
}
