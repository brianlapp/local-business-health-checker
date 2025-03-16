import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { toast } from 'sonner';

/**
 * Scan businesses in a specific area
 */
export async function scanBusinessesInArea(
  location: string, 
  radius: string, 
  maxResults: number = 20,
  useGoogle: boolean = false
): Promise<BusinessScanResponse> {
  try {
    if (useGoogle) {
      // If useGoogle is true, use the Google Maps API
      const googleResult = await scanWithGoogleMaps(location, parseInt(radius, 10));
      
      return {
        businesses: googleResult.businesses || [],
        count: googleResult.businesses?.length || 0,
        location,
        source: 'google-maps',
        debugInfo: googleResult.debugInfo
      };
    }
    
    // Otherwise, use the RPC function
    const { data, error } = await supabase
      .rpc('scan_businesses_in_area', { 
        p_location: location, 
        p_radius: radius, 
        p_max_results: maxResults 
      });

    if (error) {
      console.error('Error scanning businesses:', error);
      return { businesses: [], count: 0, location };
    }

    return {
      businesses: data?.businesses || [],
      count: data?.count || 0,
      location,
    };
  } catch (error) {
    console.error('Error in scanBusinessesInArea:', error);
    return { businesses: [], count: 0, location };
  }
}

/**
 * Scan a website with Lighthouse
 */
export async function scanWithLighthouse(businessId: string, url: string): Promise<{ 
  success: boolean; 
  reportUrl?: string; 
  note?: string;
  isRealScore?: boolean;
}> {
  try {
    // Import from businessScanService to avoid circular dependencies
    const { scanWithLighthouse: scanImpl } = await import('./businessScanService');
    return await scanImpl(businessId, url);
  } catch (error) {
    console.error('Error with Lighthouse scan:', error);
    toast.error('Lighthouse scan failed');
    return { success: false };
  }
}

/**
 * Scan a website with GTmetrix
 */
export async function scanWithGTmetrix(businessId: string, url: string): Promise<{ 
  success: boolean; 
  reportUrl?: string;
}> {
  try {
    // Import from businessScanService to avoid circular dependencies
    const { scanWithGTmetrix: scanImpl } = await import('./businessScanService');
    return await scanImpl(businessId, url);
  } catch (error) {
    console.error('Error with GTmetrix scan:', error);
    toast.error('GTmetrix scan failed');
    return { success: false };
  }
}

/**
 * Scan a website with BuiltWith
 */
export async function scanWithBuiltWith(businessId: string, website: string): Promise<{ 
  success: boolean; 
  cms?: string; 
  isMobileFriendly?: boolean;
}> {
  try {
    // Import from businessScanService to avoid circular dependencies
    const { scanWithBuiltWith: scanImpl } = await import('./businessScanService');
    return await scanImpl(businessId, website);
  } catch (error) {
    console.error('Error with BuiltWith scan:', error);
    toast.error('Technology detection failed');
    return { success: false };
  }
}

/**
 * Get businesses that need score updates
 */
export async function getBusinessesNeedingRealScores(): Promise<string[]> {
  try {
    // Import from businessScanService to avoid circular dependencies
    const { getBusinessesNeedingRealScores: getImpl } = await import('./businessScanService');
    return await getImpl();
  } catch (error) {
    console.error('Error getting businesses needing scores:', error);
    return [];
  }
}

/**
 * Get GTmetrix usage statistics
 */
export async function getGTmetrixUsage(): Promise<{ used: number; limit: number; resetDate: string }> {
  try {
    // Import from businessScanService to avoid circular dependencies
    const { getGTmetrixUsage: getImpl } = await import('./businessScanService');
    return await getImpl();
  } catch (error) {
    console.error('Error getting GTmetrix usage:', error);
    return { used: 0, limit: 3, resetDate: new Date().toISOString() };
  }
}
