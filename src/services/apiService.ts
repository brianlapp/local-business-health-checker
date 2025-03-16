
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

/**
 * Add a new business to the database
 * This is a temporary re-export to fix import errors
 */
export async function addBusiness(businessData: Partial<Business>): Promise<Business | null> {
  try {
    // Import dynamically to avoid circular dependencies
    const { addBusiness: addBusinessImpl } = await import('./businessService');
    return await addBusinessImpl(businessData);
  } catch (error) {
    console.error('Error in apiService.addBusiness:', error);
    return null;
  }
}

/**
 * Scan businesses in a specific area
 * This is a temporary re-export to fix import errors
 */
export async function scanBusinessesInArea(location: string, radius: number = 5, maxResults: number = 20) {
  try {
    // Import dynamically to avoid circular dependencies
    const { scanBusinessesInArea: scanImpl } = await import('./businessService');
    return await scanImpl(location, radius, maxResults);
  } catch (error) {
    console.error('Error in apiService.scanBusinessesInArea:', error);
    return { businesses: [], count: 0, location };
  }
}
