
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
  contact_info?: OpportunityContact;
}

export interface OpportunityContact {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  notes?: string;
}
