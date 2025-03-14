
export interface LocalBusiness {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  status: 'discovered' | 'contacted' | 'responded' | 'meeting' | 'proposal' | 'client' | 'lost';
  potential_value?: number;
  last_contacted_at?: string;
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessScanResponse {
  businesses: LocalBusiness[];
  count: number;
  location: string;
  industry?: string;
  error?: string;
  message?: string;
}
