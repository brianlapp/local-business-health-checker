
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ProposalTemplate, getProposalTemplate } from './templateService';

export interface ProposalVariables {
  [key: string]: string;
}

/**
 * Generate a proposal for a business or opportunity
 */
export async function generateProposal(
  target: Business | Opportunity,
  templateId?: string,
  customVariables?: ProposalVariables
): Promise<string> {
  console.log('Generating proposal for:', target);
  
  try {
    // Get the template
    let template: ProposalTemplate | null = null;
    
    if (templateId) {
      template = await getProposalTemplate(templateId);
    } else {
      // Get default template based on target type
      const targetType = 'title' in target ? 'opportunity' : 'business';
      const { data } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_default', true)
        .eq('category', targetType)
        .single();
      
      template = data;
    }
    
    if (!template) {
      // Use a basic template if no template is found
      return generateBasicProposal(target);
    }
    
    // Extract the target data
    const variables = extractVariables(target, customVariables);
    
    // Replace variables in the template
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    return content;
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return 'Error generating proposal. Please try again.';
  }
}

/**
 * Extract variables from the target entity
 */
function extractVariables(
  target: Business | Opportunity,
  customVariables?: ProposalVariables
): ProposalVariables {
  const variables: ProposalVariables = {
    date: new Date().toLocaleDateString(),
    ...customVariables,
  };
  
  // Determine if we're dealing with a business or opportunity
  if ('title' in target) {
    // It's an opportunity
    const opportunity = target as Opportunity;
    variables.name = opportunity.title;
    variables.client_name = opportunity.client_name || 'Client';
    variables.description = opportunity.description || '';
    if (opportunity.budget_min && opportunity.budget_max) {
      variables.budget = `${opportunity.budget_min} - ${opportunity.budget_max} ${opportunity.currency || 'USD'}`;
    } else if (opportunity.budget_min) {
      variables.budget = `${opportunity.budget_min}+ ${opportunity.currency || 'USD'}`;
    } else if (opportunity.budget_max) {
      variables.budget = `Up to ${opportunity.budget_max} ${opportunity.currency || 'USD'}`;
    } else {
      variables.budget = 'To be discussed';
    }
    variables.skills = opportunity.skills?.join(', ') || '';
  } else {
    // It's a business
    const business = target as Business;
    variables.name = business.name;
    variables.website = business.website;
    variables.score = business.opportunity_score?.toString() || 'N/A';
    variables.lighthouse_score = business.lighthouse_score?.toString() || 'N/A';
    variables.gtmetrix_score = business.gtmetrix_score?.toString() || 'N/A';
    variables.cms = business.cms || 'Unknown';
  }
  
  return variables;
}

/**
 * Generate a basic proposal when no template is available
 */
function generateBasicProposal(target: Business | Opportunity): string {
  // Determine if we're dealing with a business or opportunity
  const isBusiness = 'website' in target && !('title' in target);
  const isOpportunity = 'title' in target;
  
  // Extract the name/title appropriately
  const targetName = isBusiness ? (target as Business).name : (target as Opportunity).title;
  
  // Generate a simple proposal
  return `
# Proposal for ${targetName}

Dear ${isBusiness ? 'Team at ' + (target as Business).name : 'Hiring Manager'},

I am writing to express my interest in ${isOpportunity ? 'the ' + (target as Opportunity).title + ' position' : 'working with your business'}. 

## About Me
I am a skilled professional with expertise in web development, design, and digital marketing.

## Proposed Solution
After reviewing ${isOpportunity ? 'the requirements' : 'your website and online presence'}, I believe I can help by:
${isBusiness ? `
- Improving your website performance (currently scoring ${(target as Business).lighthouse_score || 'N/A'}/100)
- Enhancing user experience and design
- Optimizing for search engines
- Ensuring mobile compatibility
` : `
- Delivering high-quality work meeting all project requirements
- Bringing creative solutions to the challenges presented
- Maintaining clear communication throughout the project
- Ensuring timely delivery of milestones
`}

## Next Steps
I would welcome the opportunity to discuss this proposal in more detail. Please let me know if you would like to schedule a call.

Best regards,
[Your Name]
[Your Contact Information]
`;
}

/**
 * Save a proposal for a specific entity
 */
export async function saveProposal(
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string,
  content: string,
  subject?: string
): Promise<boolean> {
  try {
    const message = {
      id: uuidv4(),
      content,
      subject: subject || `Proposal - ${new Date().toLocaleDateString()}`,
      message_type: 'proposal',
      status: 'draft',
      [entityType === 'business' ? 'business_id' : 
       entityType === 'opportunity' ? 'opportunity_id' : 'agency_id']: entityId
    };
    
    const { error } = await supabase
      .from('outreach_messages')
      .insert(message);
    
    if (error) {
      console.error('Error saving proposal:', error);
      toast.error('Failed to save proposal');
      return false;
    }
    
    toast.success('Proposal saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveProposal:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Get proposals for a specific entity
 */
export async function getProposals(
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq(entityType === 'business' ? 'business_id' : 
         entityType === 'opportunity' ? 'opportunity_id' : 'agency_id', entityId)
      .eq('message_type', 'proposal')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProposals:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}
