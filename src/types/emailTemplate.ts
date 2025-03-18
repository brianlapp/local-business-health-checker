
export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  content: string;
  is_default?: boolean;
}
