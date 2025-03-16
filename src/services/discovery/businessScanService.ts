
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse } from '@/types/business';

/**
 * Search for local businesses in a specific location
 */
export async function searchLocalBusinesses(
  location: string,
  industry?: string
): Promise<BusinessScanResponse> {
  try {
    console.log(`Searching for businesses in ${location}, industry: ${industry || 'any'}`);
    
    // Placeholder implementation - would connect to business data APIs in production
    const mockBusinesses: Business[] = [
      {
        id: 'local-1',
        name: 'Local Business 1',
        website: 'localbusiness1.com',
        industry: industry || 'Technology',
        location: location,
        status: 'discovered',
        score: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'local-2',
        name: 'Local Business 2',
        website: 'localbusiness2.com',
        industry: industry || 'Retail',
        location: location,
        status: 'discovered',
        score: 60,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return {
      businesses: mockBusinesses,
      count: mockBusinesses.length,
      location,
      industry
    };
  } catch (error) {
    console.error('Error searching businesses:', error);
    toast.error('Failed to search for businesses');
    return {
      businesses: [],
      count: 0,
      location,
      industry,
      error: 'Failed to search for businesses'
    };
  }
}

/**
 * Add a local business to your database
 */
export async function addLocalBusiness(businessData: Partial<Business>): Promise<Business | null> {
  try {
    // Make sure name and status are included in the data
    if (!businessData.name) {
      throw new Error('Business name is required');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: businessData.name,
        website: businessData.website,
        industry: businessData.industry,
        location: businessData.location,
        status: businessData.status || 'discovered',
        score: businessData.score || 50
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Business added successfully');
    return {
      ...data,
      status: data.status || 'discovered',
    } as Business;
  } catch (error) {
    console.error('Error adding business:', error);
    toast.error('Failed to add business');
    return null;
  }
}

/**
 * Get all local businesses from your database
 */
export async function getLocalBusinesses(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(business => ({
      ...business,
      status: business.status || 'discovered',
    })) as Business[];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    toast.error('Failed to load businesses');
    return [];
  }
}
