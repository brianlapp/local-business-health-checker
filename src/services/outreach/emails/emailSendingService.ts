
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendEmailParams {
  to: string;
  subject: string;
  content: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  templateId?: string;
}

interface EmailResponse {
  success: boolean;
  message_id?: string;
  tracking_id?: string;
  error?: string;
}

/**
 * Send an email using the Supabase Edge Function
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResponse> {
  try {
    console.log('Sending email to:', params.to);
    
    // Generate a tracking ID for this email (UUID v4 format using crypto API)
    const trackingId = crypto.randomUUID();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        subject: params.subject,
        content: params.content,
        from_name: params.fromName || undefined,
        from_email: params.fromEmail || undefined,
        reply_to: params.replyTo || undefined,
        template_id: params.templateId || undefined,
        tracking_id: trackingId
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    // Store the email in our outreach_messages table for tracking
    await storeOutreachEmail({
      recipient_email: params.to,
      subject: params.subject,
      content: params.content,
      tracking_id: trackingId,
      message_id: data.message_id,
      template_id: params.templateId
    });
    
    return {
      success: true,
      message_id: data.message_id,
      tracking_id: trackingId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    toast.error('Failed to send email');
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

interface OutreachEmailData {
  recipient_email: string;
  subject: string;
  content: string;
  tracking_id: string;
  message_id?: string;
  template_id?: string;
}

/**
 * Store the sent email in our database for tracking purposes
 */
async function storeOutreachEmail(data: OutreachEmailData): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }
    
    const { error } = await supabase
      .from('outreach_messages')
      .insert({
        user_id: user.id,
        recipient_email: data.recipient_email,
        subject: data.subject,
        content: data.content,
        tracking_id: data.tracking_id,
        message_id: data.message_id,
        template_id: data.template_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        message_type: 'email'
      });
      
    if (error) {
      console.error('Error storing outreach email:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing outreach email:', error);
    return false;
  }
}

/**
 * Check the delivery status of an email
 */
export async function checkEmailStatus(trackingId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('status')
      .eq('tracking_id', trackingId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.status;
  } catch (error) {
    console.error('Error checking email status:', error);
    return 'unknown';
  }
}
