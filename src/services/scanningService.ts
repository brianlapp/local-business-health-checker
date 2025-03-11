
import { toast } from 'sonner';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { generateMockBusinessData } from './businessProcessingService';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { scanWithWebScraper } from './scanning/webScraperService';

/**
 * Handles errors and returns mock data as fallback
 */
export function handleScanError(
  error: any, 
  location: string | number, 
  toastId?: string
): BusinessScanResponse {
  console.error('Scan error:', error);
  
  if (toastId) {
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`, {
      id: toastId
    });
  } else {
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`);
  }
  
  // Convert location to string to ensure type compatibility
  const locationString = String(location);
  
  // Generate mock data synchronously to avoid Promise issues
  const mockBusinesses = generateMockBusinessData(locationString, 'error-fallback');
  
  // Return mock data as a fallback with proper BusinessScanResponse type
  return {
    businesses: mockBusinesses,
    count: mockBusinesses.length,
    location: locationString,
    source: 'error-fallback',
    timestamp: new Date().toISOString(),
    test_mode: true,
    error: error.message || 'Failed to search for businesses',
    message: 'Using sample data due to an error with the business search API'
  };
}

/**
 * Scans for businesses in a given area using multiple sources
 * @param location - Location to scan (city, province, country)
 * @param source - Source to use (google-maps, yellowpages, etc)
 * @param debugMode - Whether to include debug information in the response
 */
export async function scanBusinessesInArea(
  location: string, 
  source: string = 'google-maps',
  debugMode: boolean = false
): Promise<BusinessScanResponse> {
  try {
    console.log(`Scanning businesses in ${location} using ${source} with debug mode: ${debugMode}`);
    
    if (source === 'google-maps') {
      const result = await scanWithGoogleMaps(location, debugMode);
      return result as BusinessScanResponse;
    } else {
      // For other sources like yellowpages, localstack, etc.
      const result = await scanWithWebScraper(location, source, debugMode);
      
      if (Array.isArray(result)) {
        return {
          businesses: result,
          count: result.length,
          location,
          source,
          timestamp: new Date().toISOString()
        };
      }
      
      return result;
    }
  } catch (error: any) {
    return handleScanError(error, location);
  }
}
