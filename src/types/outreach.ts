
export interface OutreachMessage {
  id: string;
  user_id: string;
  entity_type?: 'business' | 'opportunity' | 'agency';
  entity_id?: string;
  recipient_email: string;
  subject: string;
  content: string;
  tracking_id: string;
  message_id?: string;
  template_id?: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  message_type: 'email' | 'follow_up';
  follow_up_count?: number;
  follow_up_scheduled?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  tracking_id?: string;
  error?: string;
}
