
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Define template interface
export interface ProposalTemplate {
  id: string;
  name: string;
  content: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

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
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', templateId)
        .single();
        
      if (error) {
        console.error('Error fetching template:', error);
        throw new Error(`Failed to fetch template: ${error.message}`);
      }
      
      template = data;
    } else {
      // Get the default template
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_default', true)
        .maybeSingle();
        
      if (!error) {
        template = data;
      }
    }
    
    // Extract the target information for proposal generation
    const targetName = isBusiness ? (target as Business).name : (target as Opportunity).title;
    const targetWebsite = isBusiness ? (target as Business).website : (target as Opportunity).client_website;
    const targetIndustry = isBusiness ? (target as Business).industry : undefined;
    
    // Create base proposal content
    let proposalContent: string;
    
    if (template) {
      // Replace placeholders in the template with actual values
      proposalContent = template.content
        .replace(/\{targetName\}/g, targetName || 'Client')
        .replace(/\{targetWebsite\}/g, targetWebsite || 'your website')
        .replace(/\{targetIndustry\}/g, targetIndustry || 'your industry')
        .replace(/\{date\}/g, new Date().toLocaleDateString());
        
    } else {
      // Generate a default proposal if no template is found
      proposalContent = `
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
    
    // Try to save the proposal in the database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        const { error } = await supabase
          .from('proposals')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            target_type: isBusiness ? 'business' : 'opportunity',
            target_id: target.id,
            content: proposalContent,
            status: 'draft',
            created_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Error saving proposal:', error);
          toast.error('Proposal generated but could not be saved');
        } else {
          toast.success('Proposal generated and saved');
        }
      } catch (insertError) {
        // Fall back to outreach_messages if proposals table doesn't exist yet
        console.warn('Falling back to outreach_messages table:', insertError);
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
        } else {
          toast.success('Proposal generated and saved');
        }
      }
    }
    
    return proposalContent;
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return 'Error generating proposal. Please try again.';
  }
}

/**
 * Save a proposal template
 */
export async function saveProposalTemplate(name: string, content: string, isDefault: boolean = false): Promise<string | null> {
  console.log('Saving proposal template:', name);
  
  try {
    const templateId = uuidv4();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // If this is being set as default, unset any existing defaults
    if (isDefault) {
      await supabase
        .from('proposal_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }
    
    const { error } = await supabase
      .from('proposal_templates')
      .insert({
        id: templateId,
        user_id: user.id,
        name,
        content,
        is_default: isDefault,
        created_at: new Date().toISOString(),
      });
      
    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
    
    toast.success('Proposal template saved successfully');
    return templateId;
  } catch (error) {
    console.error('Error saving proposal template:', error);
    toast.error('Failed to save proposal template');
    return null;
  }
}

/**
 * Get all proposal templates for the current user
 */
export async function getProposalTemplates(): Promise<ProposalTemplate[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching proposal templates:', error);
    toast.error('Failed to fetch proposal templates');
    return [];
  }
}

/**
 * Delete a proposal template
 */
export async function deleteProposalTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('proposal_templates')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
    
    toast.success('Proposal template deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting proposal template:', error);
    toast.error('Failed to delete proposal template');
    return false;
  }
}
