
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
    // Ensure required fields are present before passing to addBusinessImpl
    if (!businessData.name) {
      console.error('Business name is required');
      return null;
    }
    
    // Create a properly typed business object with required fields
    const businessToAdd = {
      name: businessData.name,
      website: businessData.website || '',
      location: businessData.location || '',
      industry: businessData.industry || '',
      status: businessData.status || 'discovered',
      source: businessData.source || 'manual',
      // Add other optional fields
      ...businessData
    };
    
    // Import dynamically to avoid circular dependencies
    const { addBusiness: addBusinessImpl } = await import('./businessService');
    return await addBusinessImpl(businessToAdd as Omit<Business, "id" | "issues">);
  } catch (error) {
    console.error('Error in apiService.addBusiness:', error);
    return null;
  }
}

/**
 * Scan businesses in a specific area
 * This is a temporary re-export to fix import errors
 */
export async function scanBusinessesInArea(
  location: string, 
  radius: number = 5, 
  maxResults: number = 20
) {
  try {
    // Import dynamically to avoid circular dependencies
    const { scanBusinessesInArea: scanImpl } = await import('./businessService');
    // Pass the radius as string to match the expected parameter type
    return await scanImpl(location, radius.toString(), maxResults);
  } catch (error) {
    console.error('Error in apiService.scanBusinessesInArea:', error);
    return { businesses: [], count: 0, location };
  }
}
