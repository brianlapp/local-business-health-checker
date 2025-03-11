
import { toast } from 'sonner';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { scanWithWebScraper } from './scanning/webScraperService';
import { handleScanError } from './scanning/scanningUtils';
import { generateMockBusinessData } from './businessProcessingService';

/**
 * Main function to scan businesses in a geographic area
 * Orchestrates different scanning strategies based on the source
 */
export const scanBusinessesInArea = async (
  location: string, 
  source: string = 'google', 
  debugMode: boolean = false
): Promise<Business[] | BusinessScanResponse> => {
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
      return handleScanError(fetchError, location, toastId);
    }
  } catch (error: any) {
    return handleScanError(error, location);
  }
};
