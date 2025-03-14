
// Opportunity Type Definitions

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string;
  source_id: string | null;
  source_url: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  status: 'new' | 'reviewing' | 'applied' | 'interviewing' | 'won' | 'lost' | 'archived';
  skills: string[];
  location: string | null;
  is_remote: boolean;
  client_name: string | null;
  client_website: string | null;
  contact_info: ContactInfo | null;
  proposal_sent_at: string | null;
  last_contact_at: string | null;
  follow_up_date: string | null;
  discovered_at: string;
  created_at: string;
  updated_at: string;
  score: number | null;
  notes: string | null;
  tags: string[];
  is_priority: boolean;
  user_id: string | null;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  linkedin?: string;
}

export interface RecruitmentAgency {
  id: string;
  name: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  specialty: string[];
  last_contacted_at: string | null;
  status: 'new' | 'contacted' | 'responsive' | 'unresponsive' | 'working_with' | 'archived';
  contact_person: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface LocalBusiness {
  id: string;
  name: string;
  website: string | null;
  current_provider: string | null;
  website_last_updated: string | null;
  technology_stack: string[];
  contact_info: ContactInfo | null;
  status: 'discovered' | 'analyzed' | 'contacted' | 'interested' | 'not_interested' | 'client' | 'archived';
  potential_value: number | null;
  improvement_opportunities: string[];
  last_contacted_at: string | null;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  technologies: string[];
  tags: string[];
  highlights: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  skills: string[];
  hourly_rate: number | null;
  availability: string | null;
  years_experience: number | null;
  avatar_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  opportunity_id: string | null;
  agency_id: string | null;
  business_id: string | null;
  message_type: 'initial_contact' | 'follow_up' | 'proposal' | 'application' | 'thank_you';
  subject: string | null;
  content: string;
  sent_at: string | null;
  scheduled_for: string | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  opened_at: string | null;
  replied_at: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface ScrapedData {
  id: string;
  source: string;
  source_id: string | null;
  raw_data: Record<string, any>;
  processed: boolean;
  opportunity_created: boolean;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}
