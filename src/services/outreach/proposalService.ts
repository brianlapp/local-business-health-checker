
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';

/**
 * Generate a proposal based on a business or opportunity
 */
export async function generateProposal(
  target: Business | Opportunity,
  templateId?: string
): Promise<string> {
  try {
    console.log(`Generating proposal for ${target.name || target.title}`);
    
    // In a real implementation, this would use an AI service or template system
    // For now, return a placeholder
    const proposalContent = `
# Proposal for ${target.name || target.title}

## Introduction
We're excited to present this proposal for [your services].

## Objectives
- Objective 1
- Objective 2
- Objective 3

## Approach
Our approach will include the following phases:
1. Discovery
2. Strategy
3. Implementation
4. Review

## Timeline
The project will take approximately X weeks to complete.

## Investment
$X,XXX - $X,XXX

## Next Steps
To move forward, please [instructions].
    `;
    
    toast.success('Proposal generated');
    return proposalContent;
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return '';
  }
}

/**
 * Save a proposal template
 */
export async function saveProposalTemplate(
  name: string,
  content: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('proposal_templates')
      .insert({
        name,
        content,
        user_id: userId
      });
    
    if (error) throw error;
    
    toast.success('Proposal template saved');
    return true;
  } catch (error) {
    console.error('Error saving proposal template:', error);
    toast.error('Failed to save proposal template');
    return false;
  }
}
