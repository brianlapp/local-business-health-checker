import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { ensureBusinessStatus, isCMSOutdated, isWebsiteSecure } from './businessUtilsService';

/**
 * Get all businesses from the database
 */
export async function getBusinesses(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    
    // Use our utility function to ensure all businesses have the correct shape
    return data.map(business => ensureBusinessStatus(business));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
}
