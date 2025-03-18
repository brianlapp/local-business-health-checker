
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { supabase } from '@/integrations/supabase/client';
import { ProposalTemplate, getProposalTemplateById, getDefaultProposalTemplate } from '../templates/proposalTemplateService';

/**
 * Generate a proposal for a business or opportunity
 */
export async function generateProposal(
  target: Business | Opportunity,
  templateId?: string
): Promise<string> {
  console.log('Generating proposal for:', target);
  
  try {
    // Determine if we're dealing with a business or opportunity
    const isBusiness = 'name' in target && !('title' in target);
    const isOpportunity = 'title' in target;
    
    let template: ProposalTemplate | null = null;
    
    // If templateId is provided, fetch the template
    if (templateId) {
      template = await getProposalTemplateById(templateId);
    } else {
      // Get the default template
      template = await getDefaultProposalTemplate();
    }
    
    // Extract the target information for proposal generation
    const targetName = isBusiness ? (target as Business).name : (target as Opportunity).title;
    const targetWebsite = isBusiness ? (target as Business).website : (target as Opportunity).client_website;
    const targetIndustry = isBusiness ? (target as Business).industry : undefined;
    
    // Create proposal content
    let proposalContent = await createProposalContent(template, {
      targetName, 
      targetWebsite, 
      targetIndustry,
      isBusiness,
      target
    });
    
    // Try to save the proposal in the database if user is authenticated
    await saveProposalToDatabase(proposalContent, isBusiness, isOpportunity, target);
    
    return proposalContent;
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return 'Error generating proposal. Please try again.';
  }
}

/**
 * Create the content for a proposal based on a template or default structure
 */
async function createProposalContent(
  template: ProposalTemplate | null,
  props: {
    targetName: string | undefined;
    targetWebsite: string | undefined;
    targetIndustry: string | undefined;
    isBusiness: boolean;
    target: Business | Opportunity;
  }
): Promise<string> {
  const { targetName, targetWebsite, targetIndustry, isBusiness, target } = props;
  
  if (template) {
    // Replace placeholders in the template with actual values
    return template.content
      .replace(/\{targetName\}/g, targetName || 'Client')
      .replace(/\{targetWebsite\}/g, targetWebsite || 'your website')
      .replace(/\{targetIndustry\}/g, targetIndustry || 'your industry')
      .replace(/\{date\}/g, new Date().toLocaleDateString());
  } else {
    // Generate a default proposal if no template is found
    const isOpportunity = 'title' in target;
    
    return `
# Proposal for ${targetName}

Dear ${isBusiness ? 'Team at ' + (target as Business).name : 'Hiring Manager'},

I am writing to express my interest in ${isOpportunity ? 
  'the ' + (target as Opportunity).title + ' position' : 
  'working with your business to improve your online presence and digital performance'}.

${isBusiness && (target as Business).score ? 
  `Based on our analysis, your website currently scores ${(target as Business).score}/100, indicating opportunities for improvement in performance, user experience, and conversion optimization.` : 
  ''}

## Proposed Services

${isBusiness ? `
${(target as Business).issues?.speedIssues ? '- **Performance Optimization**: Improve your website loading speed and responsiveness.\n' : ''}
${(target as Business).issues?.outdatedCMS ? '- **CMS Modernization**: Update your content management system for better security and features.\n' : ''}
${(target as Business).issues?.noSSL ? '- **Security Enhancement**: Implement SSL certification and security best practices.\n' : ''}
${(target as Business).issues?.notMobileFriendly ? '- **Mobile Optimization**: Make your website fully responsive across all devices.\n' : ''}
${(target as Business).issues?.badFonts ? '- **UI/UX Improvements**: Enhance typography and overall user experience.\n' : ''}
` : '- Custom development and implementation based on your requirements.\n- Ongoing support and maintenance.\n- Performance monitoring and optimization.'}

## Timeline and Process

1. **Discovery Phase** (1-2 weeks): Understand your business goals and specific requirements.
2. **Strategy Development** (1 week): Creating a detailed plan for implementation.
3. **Implementation** (2-4 weeks): Building and deploying the solutions.
4. **Testing & Refinement** (1 week): Ensuring everything works perfectly.
5. **Launch & Support**: Ongoing assistance and optimization.

## Why Choose Me

- Proven track record of success in similar projects
- Tailored solutions that fit your specific business needs
- Commitment to quality and client satisfaction
- Transparent communication throughout the process

I would welcome the opportunity to discuss how I can help ${isBusiness ? 
  (target as Business).name : 
  'your organization'} achieve its goals. Please let me know if you would like to schedule a call.

Best regards,
[Your Name]
[Your Contact Information]
    `;
  }
}

/**
 * Save generated proposal to the database
 */
async function saveProposalToDatabase(
  proposalContent: string,
  isBusiness: boolean,
  isOpportunity: boolean,
  target: Business | Opportunity
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return;
  }
  
  try {
    console.log('Saving to outreach_messages table as fallback');
    const { error: fallbackError } = await supabase
      .from('outreach_messages')
      .insert({
        id: uuidv4(),
        user_id: user.id,
        message_type: 'proposal',
        content: proposalContent,
        status: 'draft',
        business_id: isBusiness ? target.id : null,
        opportunity_id: isOpportunity ? target.id : null,
      });
    
    if (fallbackError) {
      console.error('Error with fallback save:', fallbackError);
      toast.error('Failed to save proposal');
    } else {
      toast.success('Proposal generated and saved');
    }
  } catch (insertError) {
    console.error('Error saving proposal:', insertError);
    toast.error('Failed to save proposal');
  }
}
