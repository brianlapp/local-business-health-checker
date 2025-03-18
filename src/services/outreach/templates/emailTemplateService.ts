
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate, EmailTemplateFormData } from '@/types/emailTemplate';

/**
 * Save an email template
 */
export async function saveEmailTemplate(templateData: EmailTemplateFormData): Promise<string | null> {
  console.log('Saving email template:', templateData.name);
  
  try {
    const templateId = uuidv4();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // If this is being set as default, unset any existing defaults
    if (templateData.is_default) {
      await supabase
        .from('email_templates')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }
    
    const { error } = await supabase
      .from('email_templates')
      .insert({
        id: templateId,
        user_id: user.id,
        name: templateData.name,
        subject: templateData.subject,
        content: templateData.content,
        is_default: templateData.is_default || false,
        created_at: new Date().toISOString(),
      });
      
    if (error) {
      throw new Error(`Failed to save template: ${error.message}`);
    }
    
    toast.success('Email template saved successfully');
    return templateId;
  } catch (error) {
    console.error('Error saving email template:', error);
    toast.error('Failed to save email template');
    return null;
  }
}

/**
 * Get all email templates for the current user
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
    
    return data as EmailTemplate[] || [];
  } catch (error) {
    console.error('Error fetching email templates:', error);
    toast.error('Failed to fetch email templates');
    return [];
  }
}

/**
 * Delete an email template
 */
export async function deleteEmailTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
    
    toast.success('Email template deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting email template:', error);
    toast.error('Failed to delete email template');
    return false;
  }
}

/**
 * Get an email template by ID
 */
export async function getEmailTemplateById(id: string): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw new Error(`Failed to fetch template: ${error.message}`);
    }
    
    return data as EmailTemplate;
  } catch (error) {
    console.error('Error fetching email template:', error);
    return null;
  }
}

/**
 * Get the default email template for the current user
 */
export async function getDefaultEmailTemplate(): Promise<EmailTemplate | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Failed to fetch default template: ${error.message}`);
    }
    
    return data as EmailTemplate;
  } catch (error) {
    console.error('Error fetching default email template:', error);
    return null;
  }
}
