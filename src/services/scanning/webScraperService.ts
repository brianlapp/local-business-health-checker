import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { invokeEdgeFunction } from '../api/supabaseApiClient';
import { processScrapedBusinesses, generateMockBusinessData } from '../businessProcessingService';

/**
 * Scans for businesses using the web scraper edge function
 * @param location - Location to scan
 * @param source - Source to use (yellowpages or localstack)
 * @param debugMode - Whether to include debug information
 */
export async function scanWithWebScraper(
  location: string, 
  source: string = 'yellowpages', 
  debugMode: boolean = false
): Promise<Business[] | BusinessScanResponse> {
  try {
    console.log(`Scanning with web-scraper: ${location}, source: ${source}, debug: ${debugMode}`);
    
    // Call the edge function to scrape for businesses
    const { data, error } = await invokeEdgeFunction('web-scraper', { 
      location, 
      source, 
      debug: debugMode 
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to search for businesses');
    }
    
    console.log('Web scraper response:', data);
    
    // Handle new response format which includes businesses array
    if (data && data.businesses && Array.isArray(data.businesses)) {
      // Check if debug info was returned and log it
      if (debugMode && data.debug) {
        console.log('Debug info:', data.debug);
      }
      
      const processedBusinesses = await processScrapedBusinesses(data.businesses, source, location);
      
      // Return the full response with debug info if in debug mode
      if (debugMode && data.debug) {
        return {
          businesses: processedBusinesses,
          count: processedBusinesses.length,
          location,
          source,
          timestamp: new Date().toISOString(),
          debugInfo: data.debug as ScanDebugInfo
        };
      }
      
      return processedBusinesses;
    }
    
    // Fallback for older format or errors
    if (data?.error) {
      console.error('Web scraper error:', data.error);
      
      // If we got preview data despite an error, use it
      if (data.businesses && data.businesses.length > 0) {
        return await processScrapedBusinesses(data.businesses, source, location);
      }
      
      throw new Error(data.message || data.error);
    }
    
    // If no businesses found
    if (!data?.businesses || data.businesses.length === 0) {
      return [];
    }
    
    // Otherwise process the scraped businesses
    return await processScrapedBusinesses(data.businesses, source, location);
  } catch (error: any) {
    console.error('Error in web scraper scan:', error);
    // Use preview data as fallback if there's an error
    return generateMockBusinessData(location);
  }
}
