import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { toast } from 'sonner';
import { processScrapedBusinesses, generateMockBusinessData } from './businessProcessingService';

// Function to scan businesses in a geographic area using Google Maps API
export const scanBusinessesInArea = async (location: string, source: string = 'google', debugMode: boolean = false): Promise<Business[] | BusinessScanResponse> => {
  try {
    console.log(`Scanning businesses in ${location} using ${source} source with debug mode: ${debugMode ? 'ON' : 'OFF'}`);
    
    // Show toast to user
    const toastId = toast.loading(`Scanning for businesses in ${location}...`);
    
    let businesses: Business[] = [];
    let debugInfo: ScanDebugInfo | null = null;
    let testMode = false;
    let errorInfo = null;
    let apiMessage = null;
    let troubleshooting = null;
    
    try {
      // Choose the appropriate source for business data
      if (source === 'google') {
        // Use Google Maps API
        const result = await scanWithGoogleMaps(location);
        
        // Only consider it an error if no businesses were found AND there's an error message
        if (result.error && (!result.businesses || result.businesses.length === 0)) {
          toast.error(`Error: ${result.message || result.error}`, {
            id: toastId
          });
          
          errorInfo = result.error;
          apiMessage = result.message;
          troubleshooting = result.troubleshooting;
          testMode = result.test_mode || false;
          
          // If Google Maps API fails, try using localstack (which gives mock data)
          console.log('Falling back to localstack due to Google Maps API error');
          businesses = await generateMockBusinessData(location, 'fallback');
        } else {
          businesses = result.businesses;
          testMode = result.test_mode || false;
          
          toast.success(`Found ${businesses.length} businesses in ${location} using Google Maps`, {
            id: toastId
          });
        }
      } 
      else if (source === 'yellowpages') {
        // Use web scraper with YellowPages source
        const result = await scanWithWebScraper(location, 'yellowpages', debugMode);
        businesses = Array.isArray(result) ? result : result.businesses;
        
        if ('debugInfo' in result) {
          debugInfo = result.debugInfo;
        }
        
        toast.success(`Found ${businesses.length} businesses in ${location}`, {
          id: toastId
        });
      } 
      else if (source === 'localstack') {
        // Use localstack source (delivers mock data)
        const result = await scanWithWebScraper(location, 'localstack', debugMode);
        businesses = Array.isArray(result) ? result : result.businesses;
        testMode = true;
        
        if ('debugInfo' in result) {
          debugInfo = result.debugInfo;
        }
        
        toast.success(`Found ${businesses.length} sample businesses in ${location}`, {
          id: toastId
        });
      }
      else {
        // Unknown source
        toast.error(`Unknown source: ${source}`, {
          id: toastId
        });
        return [];
      }
      
      // Return the full response with additional info if available
      if (errorInfo || debugInfo || testMode || apiMessage || troubleshooting) {
        return {
          businesses,
          count: businesses.length,
          location,
          source,
          timestamp: new Date().toISOString(),
          test_mode: testMode,
          error: businesses.length > 0 ? null : errorInfo, // Don't return error if we have businesses
          message: businesses.length > 0 ? null : apiMessage, // Don't return message if we have businesses
          troubleshooting,
          debugInfo: debugInfo
        };
      }
      
      return businesses;
    } catch (fetchError: any) {
      console.error('Scan error:', fetchError);
      
      toast.error(`Error: ${fetchError.message || 'Failed to search for businesses'}`, {
        id: toastId
      });
      
      // Return mock data as a fallback with proper BusinessScanResponse type
      return {
        businesses: await generateMockBusinessData(location, 'error-fallback'),
        count: (await generateMockBusinessData(location, 'error-fallback')).length,
        location,
        source: 'error-fallback',
        timestamp: new Date().toISOString(),
        test_mode: true,
        error: fetchError.message || 'Failed to search for businesses',
        message: 'Using sample data due to an error with the business search API'
      };
    }
  } catch (error: any) {
    console.error('Error scanning businesses:', error);
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`);
    return [];
  }
};

// Function to scan businesses using Google Maps API
async function scanWithGoogleMaps(location: string, radius: number = 10): Promise<{
  businesses: Business[], 
  error?: string, 
  message?: string,
  troubleshooting?: string,
  test_mode?: boolean,
  count?: number,
  location?: string,
  source?: string,
  timestamp?: string
}> {
  try {
    console.log(`Scanning with Google Maps API: ${location}, radius: ${radius}km`);
    
    // Call the edge function to search for businesses using Google Maps
    const { data, error } = await supabase.functions.invoke('google-maps-search', {
      body: { location, radius }
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
    if (data.businesses && data.businesses.length > 0) {
      // Process the businesses and convert them to our format
      const processedBusinesses = await processScrapedBusinesses(data.businesses, 'google-maps', location);
      
      return {
        businesses: processedBusinesses,
        test_mode: data.test_mode || false,
        count: processedBusinesses.length,
        location,
        source: 'google-maps',
        timestamp: new Date().toISOString()
      };
    }
    
    // Only consider it an error if no businesses were found
    if (!data.businesses || data.businesses.length === 0) {
      return {
        businesses: [],
        error: data.error || 'No businesses found',
        message: data.message || 'No businesses with websites were found in this location.',
        test_mode: data.test_mode || false,
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
      timestamp: new Date().toISOString()
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

// Function to scan businesses using web scraper edge function (YellowPages or LocalStack)
async function scanWithWebScraper(location: string, source: string = 'yellowpages', debugMode: boolean = false): Promise<Business[] | BusinessScanResponse> {
  try {
    console.log(`Scanning with web-scraper: ${location}, source: ${source}, debug: ${debugMode}`);
    
    // Call the edge function to scrape for businesses
    const { data, error } = await supabase.functions.invoke('web-scraper', {
      body: { location, source, debug: debugMode }
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
    if (data.error) {
      console.error('Web scraper error:', data.error);
      
      // If we got mock data despite an error, use it
      if (data.mockData && data.businesses && data.businesses.length > 0) {
        const mockBusinesses = await generateMockBusinessData(data.businesses, location);
        return mockBusinesses;
      }
      
      throw new Error(data.message || data.error);
    }
    
    // If no businesses found
    if (!data.businesses || data.businesses.length === 0) {
      return [];
    }
    
    // If it's mock data
    if (data.mockData) {
      const mockBusinesses = await generateMockBusinessData(data.businesses, location);
      return mockBusinesses;
    }
    
    // Otherwise process the scraped businesses
    return await processScrapedBusinesses(data.businesses, source, location);
  } catch (error: any) {
    console.error('Error in web scraper scan:', error);
    throw error;
  }
}
