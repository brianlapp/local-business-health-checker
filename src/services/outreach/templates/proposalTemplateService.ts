
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Get a proposal template by ID
 */
export async function getProposalTemplateById(id: string): Promise<ProposalTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(`Failed to fetch template: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching proposal template:', error);
    return null;
  }
}

/**
 * Get the default proposal template for the current user
 */
export async function getDefaultProposalTemplate(): Promise<ProposalTemplate | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Failed to fetch default template: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching default proposal template:', error);
    return null;
  }
}
