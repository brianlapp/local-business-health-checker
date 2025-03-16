
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
    
    // Default approach - fetch from businesses table with filtering
    // This replaces the RPC call that was causing the error
    const radiusNum = parseInt(radius, 10);
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .limit(maxResults);
      
    if (error) {
      console.error('Error scanning businesses:', error);
      return { businesses: [], count: 0, location };
    }
    
    // Filter businesses based on location (simple contains match)
    // This is a simplified approach - ideally would use geographic filtering
    const filteredBusinesses = data.filter(business => 
      business.location && business.location.toLowerCase().includes(location.toLowerCase())
    );

    return {
      businesses: filteredBusinesses || [],
      count: filteredBusinesses.length || 0,
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
    // Call the appropriate Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('lighthouse-scan', {
      body: { businessId, url }
    });
    
    if (error) throw error;
    
    return data || { success: false };
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
    // Call the appropriate Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gtmetrix-scan', {
      body: { businessId, url }
    });
    
    if (error) throw error;
    
    return data || { success: false };
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
    // Call the appropriate Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('builtwith-scan', {
      body: { businessId, website }
    });
    
    if (error) throw error;
    
    return data || { success: false };
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
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .is('lighthouse_score', null)
      .limit(10);
      
    if (error) throw error;
    
    return (data || []).map(business => business.id);
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
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    return { 
      used: data.scans_used, 
      limit: data.scans_limit, 
      resetDate: data.reset_date || new Date().toISOString() 
    };
  } catch (error) {
    console.error('Error getting GTmetrix usage:', error);
    return { used: 0, limit: 3, resetDate: new Date().toISOString() };
  }
}
