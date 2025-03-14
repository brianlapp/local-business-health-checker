
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  source: string;
  source_id: string;
  url: string;
  company_name: string;
  location: string;
  is_remote: boolean;
  compensation_min: number | null;
  compensation_max: number | null;
  compensation_type: 'hourly' | 'fixed' | 'salary' | 'unknown';
  skills_required: string[];
  posted_date: string;
  deadline: string | null;
  score: number;
  status: 'new' | 'reviewing' | 'applied' | 'interview' | 'offer' | 'rejected' | 'archived';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  website: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  location_data: {
    lat: number;
    lng: number;
    formatted_address?: string;
  } | null;
  specialization: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  website: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  location_data: {
    lat: number;
    lng: number;
    formatted_address?: string;
  } | null;
  industry: string | null;
  size: string | null;
  agency_id: string | null;
  website_score: number | null;
  website_issues: {
    speedIssues?: boolean;
    outdatedCMS?: boolean;
    noSSL?: boolean;
    notMobileFriendly?: boolean;
    badFonts?: boolean;
    otherIssues?: string[];
  } | null;
  last_updated: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Outreach {
  id: string;
  entity_type: 'agency' | 'business' | 'opportunity';
  entity_id: string;
  contact_name: string | null;
  contact_email: string;
  template_used: string | null;
  subject: string;
  content: string;
  sent_at: string | null;
  status: 'draft' | 'sent' | 'opened' | 'replied' | 'completed' | 'failed';
  response_received: string | null;
  response_time: string | null; // PostgreSQL interval as string
  follow_up_scheduled: string | null;
  follow_up_count: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'email' | 'proposal' | 'followup';
  subject: string;
  content: string;
  variables: {
    name: string;
    description: string;
    required: boolean;
  }[];
  target_entity_type: 'agency' | 'business' | 'opportunity';
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  skills: string[];
  industry: string | null;
  created_at: string;
  updated_at: string;
}
