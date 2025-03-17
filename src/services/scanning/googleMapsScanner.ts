
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { invokeEdgeFunction } from '../api/supabaseApiClient';
import { processScrapedBusinesses } from '../businessProcessingService';

/**
 * Scans for businesses using Google Maps API
 * @param location - Location to scan (city, province, country)
 * @param radius - Radius in kilometers to scan
 * @param limit - Maximum number of businesses to return
 */
export async function scanWithGoogleMaps(
  location: string, 
  radius: number = 10, 
  limit: number = 20
): Promise<{
  businesses: Business[], 
  error?: string, 
  message?: string,
  troubleshooting?: string,
  test_mode?: boolean,
  count?: number,
  location?: string,
  source?: string,
  timestamp?: string,
  debugInfo?: ScanDebugInfo
}> {
  try {
    console.log(`Scanning with Google Maps API: ${location}, radius: ${radius}km, limit: ${limit}`);
    
    // Call the edge function to search for businesses using Google Maps
    const { data, error } = await invokeEdgeFunction('google-maps-search', { 
      location, 
      radius,
      limit
    });
    
    if (error) {
      console.error('Google Maps edge function error:', error);
      return { 
        businesses: [], 
        error: error.message || 'Failed to connect to Google Maps API',
        message: 'There was an issue connecting to the Google Maps API. Please try again later.',
        test_mode: true,
        count: 0,
        location,
        source: 'google-maps',
        timestamp: new Date().toISOString()
      };
    }
    
    console.log('Google Maps response:', data);
    
    // Check if we actually have businesses regardless of error status
    if (data?.businesses && data.businesses.length > 0) {
      // Process the businesses and convert them to our format
      const processedBusinesses = await processScrapedBusinesses(data.businesses, 'google-maps', location);
      
      return {
        businesses: processedBusinesses,
        test_mode: data.test_mode || false,
        count: processedBusinesses.length,
        location,
        source: 'google-maps',
        timestamp: new Date().toISOString(),
        debugInfo: data.debugInfo
      };
    }
    
    // Only consider it an error if no businesses were found
    if (!data?.businesses || data.businesses.length === 0) {
      return {
        businesses: [],
        error: data?.error || 'No businesses found',
        message: data?.message || 'No businesses with websites were found in this location.',
        test_mode: data?.test_mode || false,
        count: 0,
        location,
        source: 'google-maps',
        timestamp: new Date().toISOString()
      };
    }
    
    // Process the businesses and convert them to our format
    const processedBusinesses = await processScrapedBusinesses(data.businesses, 'google-maps', location);
    
    return {
      businesses: processedBusinesses,
      test_mode: data.test_mode || false,
      count: processedBusinesses.length,
      location,
      source: 'google-maps',
      timestamp: new Date().toISOString(),
      debugInfo: data.debugInfo
    };
  } catch (error: any) {
    console.error('Error in Google Maps scan:', error);
    return {
      businesses: [],
      error: error.message || 'An unexpected error occurred',
      message: 'Failed to search for businesses using Google Maps.',
      test_mode: true,
      count: 0,
      location,
      source: 'google-maps',
      timestamp: new Date().toISOString()
    };
  }
}
