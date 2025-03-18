
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface EmailMessage {
  id: string;
  subject: string;
  content: string;
  business_id?: string;
  opportunity_id?: string;
  agency_id?: string;
  scheduled_for?: string; 
  status: 'draft' | 'scheduled' | 'sent' | 'opened' | 'replied' | 'failed';
  sent_at?: string;
  opened_at?: string;
  replied_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new email draft
 */
export async function createEmailDraft(
  subject: string,
  content: string,
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string
): Promise<EmailMessage | null> {
  try {
    const message = {
      id: uuidv4(),
      subject,
      content,
      [entityType === 'business' ? 'business_id' : 
       entityType === 'opportunity' ? 'opportunity_id' : 'agency_id']: entityId,
      message_type: 'email',
      status: 'draft'
    };
    
    const { data, error } = await supabase
      .from('outreach_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating email draft:', error);
      toast.error('Failed to create email draft');
      return null;
    }
    
    toast.success('Email draft created');
    return data;
  } catch (error) {
    console.error('Error in createEmailDraft:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

/**
 * Schedule an email to be sent later
 */
export async function scheduleEmail(
  emailId: string,
  scheduledDate: Date
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('outreach_messages')
      .update({
        status: 'scheduled',
        scheduled_for: scheduledDate.toISOString()
      })
      .eq('id', emailId);
    
    if (error) {
      console.error('Error scheduling email:', error);
      toast.error('Failed to schedule email');
      return false;
    }
    
    toast.success('Email scheduled successfully');
    return true;
  } catch (error) {
    console.error('Error in scheduleEmail:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Send an email immediately
 */
export async function sendEmail(emailId: string): Promise<boolean> {
  try {
    // In a real implementation, this would call an Edge Function
    // to actually send the email using a service like SendGrid or Resend
    
    // For now, we'll just update the status
    const { error } = await supabase
      .from('outreach_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', emailId);
    
    if (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
      return false;
    }
    
    toast.success('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Get emails for a specific entity
 */
export async function getEmails(
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string
): Promise<EmailMessage[]> {
  try {
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq(entityType === 'business' ? 'business_id' : 
         entityType === 'opportunity' ? 'opportunity_id' : 'agency_id', entityId)
      .eq('message_type', 'email')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to load emails');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getEmails:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

/**
 * Record that an email was opened
 */
export async function recordEmailOpen(emailId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('outreach_messages')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .is('opened_at', null); // Only update if not already opened
    
    if (error) {
      console.error('Error recording email open:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordEmailOpen:', error);
    return false;
  }
}

/**
 * Record that an email received a reply
 */
export async function recordEmailReply(emailId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('outreach_messages')
      .update({
        status: 'replied',
        replied_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .is('replied_at', null); // Only update if not already replied to
    
    if (error) {
      console.error('Error recording email reply:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordEmailReply:', error);
    return false;
  }
}
