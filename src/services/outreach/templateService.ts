
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface ProposalTemplate {
  id: string;
  name: string;
  content: string;
  category?: string;
  variables?: string[];
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all proposal templates
 */
export async function getProposalTemplates(): Promise<ProposalTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching proposal templates:', error);
      toast.error('Failed to load proposal templates');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProposalTemplates:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

/**
 * Get a specific proposal template by ID
 */
export async function getProposalTemplate(id: string): Promise<ProposalTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching proposal template:', error);
      toast.error('Failed to load proposal template');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getProposalTemplate:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

/**
 * Save a new proposal template
 */
export async function saveProposalTemplate(template: Omit<ProposalTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ProposalTemplate | null> {
  try {
    const newTemplate = {
      ...template,
      id: uuidv4(),
    };
    
    const { data, error } = await supabase
      .from('proposal_templates')
      .insert(newTemplate)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving proposal template:', error);
      toast.error('Failed to save proposal template');
      return null;
    }
    
    toast.success('Proposal template saved successfully');
    return data;
  } catch (error) {
    console.error('Error in saveProposalTemplate:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

/**
 * Update an existing proposal template
 */
export async function updateProposalTemplate(template: ProposalTemplate): Promise<ProposalTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .update({
        name: template.name,
        content: template.content,
        category: template.category,
        variables: template.variables,
        is_default: template.is_default
      })
      .eq('id', template.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating proposal template:', error);
      toast.error('Failed to update proposal template');
      return null;
    }
    
    toast.success('Proposal template updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateProposalTemplate:', error);
    toast.error('An unexpected error occurred');
    return null;
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
      console.error('Error deleting proposal template:', error);
      toast.error('Failed to delete proposal template');
      return false;
    }
    
    toast.success('Proposal template deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProposalTemplate:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}
