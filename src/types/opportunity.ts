
export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  source: 'job_board' | 'recruiting_agency' | 'direct_client' | 'other';
  source_id?: string;
  source_url?: string;
  client_name?: string;
  client_website?: string;
  location?: string;
  is_remote?: boolean;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  status: 'new' | 'reviewing' | 'applied' | 'interviewing' | 'won' | 'lost' | 'archived';
  is_priority?: boolean;
  skills?: string[];
  tags?: string[];
  notes?: string;
  score?: number;
  discovered_at?: string;
  proposal_sent_at?: string;
  last_contact_at?: string;
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
  contact_info?: OpportunityContact;
  name?: string; // For compatibility with Business interface in proposalService
}

export interface OpportunityContact {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
  
  // Adding the missing fields that are used in ProfileForm
  hourly_rate?: number;
  availability?: string;
  years_experience?: number;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  timezone?: string;
}

// For JobSearchResults.tsx
export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  url: string;
  location?: string;
  salary?: string; // Added to match usage in JobSearchResults.tsx
  skills?: string[];
  datePosted: string; // Added to match usage in JobSearchResults.tsx
  source: string; // Added to match usage in JobSearchResults.tsx
}

export interface JobBoardResponse {
  jobs: JobListing[];
  source: string; // Added to match usage in JobSearchResults.tsx
  count: number;
  location?: string;
  query?: string;
}
