
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

/**
 * Generate a proposal based on opportunity data and template
 */
export async function generateProposal(opportunityId: string, templateId?: string) {
  try {
    console.log(`Generating proposal for opportunity ${opportunityId} using template ${templateId || 'default'}`);
    
    // Get opportunity details
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (opportunityError) throw opportunityError;
    
    // Get template
    let template: any = null;
    
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError) throw templateError;
      template = templateData;
    } else {
      // Get default template
      const { data: defaultTemplate, error: defaultTemplateError } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_default', true)
        .single();
      
      if (!defaultTemplateError) {
        template = defaultTemplate;
      }
    }
    
    // In a real implementation, this would use AI to generate a customized proposal
    const proposalContent = template ? template.content : 'Default proposal content...';
    
    return {
      content: proposalContent,
      opportunity,
      template
    };
  } catch (error) {
    console.error('Error generating proposal:', error);
    toast.error('Failed to generate proposal');
    return null;
  }
}

/**
 * Save a proposal template
 */
export async function saveProposalTemplate(templateData: any) {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .insert(templateData)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Proposal template saved');
    return data;
  } catch (error) {
    console.error('Error saving proposal template:', error);
    toast.error('Failed to save proposal template');
    return null;
  }
}
