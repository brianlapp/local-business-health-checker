import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse } from '@/types/business';

/**
 * Scan businesses in a specific area
 */
export async function scanBusinessesInArea(
  location: string, 
  radius: string, 
  maxResults: number = 20
): Promise<BusinessScanResponse> {
  try {
    const { data, error } = await supabase
      .rpc('scan_businesses_in_area', { location, radius, maxResults });

    if (error) {
      console.error('Error scanning businesses:', error);
      return { businesses: [], count: 0, location };
    }

    return {
      businesses: data.businesses || [],
      count: data.count || 0,
      location,
    };
  } catch (error) {
    console.error('Error in scanBusinessesInArea:', error);
    return { businesses: [], count: 0, location };
  }
}
