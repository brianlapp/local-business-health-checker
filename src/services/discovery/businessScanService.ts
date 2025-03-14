
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Search for local businesses in an area
 */
export async function searchLocalBusinesses(location: string, industry?: string) {
  try {
    console.log(`Searching for local businesses in ${location}, industry: ${industry || 'any'}`);
    
    // Placeholder implementation
    return {
      businesses: [],
      count: 0,
      location,
      industry
    };
  } catch (error) {
    console.error('Error searching local businesses:', error);
    toast.error('Failed to search local businesses');
    return {
      businesses: [],
      count: 0,
      location,
      industry,
      error: 'Failed to search local businesses'
    };
  }
}

/**
 * Add a local business to your database
 */
export async function addLocalBusiness(businessData: any) {
  try {
    const { data, error } = await supabase
      .from('local_businesses')
      .insert(businessData)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Business added successfully');
    return data;
  } catch (error) {
    console.error('Error adding local business:', error);
    toast.error('Failed to add local business');
    return null;
  }
}

/**
 * Get a list of local businesses from the database
 */
export async function getLocalBusinesses() {
  try {
    const { data, error } = await supabase
      .from('local_businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching local businesses:', error);
    toast.error('Failed to fetch local businesses');
    return [];
  }
}
