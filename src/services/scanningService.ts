
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { scanWithWebScraper } from './scanning/webScraperService';

/**
 * Scan for businesses in a specific area
 */
export async function scanBusinessesInArea(
  location: string, 
  source: string = 'google',
  debugMode: boolean = false
): Promise<BusinessScanResponse> {
  try {
    console.log(`Scanning for businesses in ${location} using ${source} source`);
    
    let response: BusinessScanResponse;
    
    if (source === 'google') {
      const googleResponse = await scanWithGoogleMaps(location, 10); // Fixed: Passing 10 as a number instead of boolean
      response = {
        businesses: googleResponse.businesses,
        count: googleResponse.businesses.length, // Ensure count is set and non-optional
        location: location,
        error: googleResponse.error,
        message: googleResponse.message,
        troubleshooting: googleResponse.troubleshooting,
        test_mode: googleResponse.test_mode,
        source: googleResponse.source,
        timestamp: googleResponse.timestamp,
        // Only include debugInfo if it exists in the googleResponse
        ...(googleResponse.debugInfo && { debugInfo: googleResponse.debugInfo })
      };
    } else if (source === 'yellowpages') {
      const scraperResponse = await scanWithWebScraper(location, 'yellowpages', debugMode);
      
      // Check if we received a BusinessScanResponse or just Business[] array
      if (Array.isArray(scraperResponse)) {
        response = {
          businesses: scraperResponse,
          count: scraperResponse.length, // Ensure count is set and non-optional
          location: location,
          source: 'yellowpages'
        };
      } else {
        // Ensure count is always set
        response = {
          ...scraperResponse,
          count: scraperResponse.businesses.length
        };
      }
    } else {
      // For local testing with mock data
      const mockBusinesses = generateMockBusinesses(location, 5);
      response = {
        businesses: mockBusinesses,
        count: mockBusinesses.length, // Ensure count is non-optional
        location: location,
        test_mode: true,
        source: 'localstack',
        timestamp: new Date().toISOString()
      };
    }
    
    // Save businesses to database if they don't already exist
    if (response.businesses && response.businesses.length > 0) {
      await saveBusinessesToDatabase(response.businesses);
    }
    
    return response;
  } catch (error: any) {
    console.error('Error scanning businesses:', error);
    toast.error('Failed to scan businesses');
    
    // Return a valid BusinessScanResponse with required fields
    return {
      businesses: [],
      count: 0, // Ensure count is non-optional
      location,
      error: error.message || 'Failed to scan businesses',
      source: source
    };
  }
}

/**
 * Save a list of businesses to the database
 */
async function saveBusinessesToDatabase(businesses: Business[]): Promise<void> {
  try {
    // Save businesses in batches to avoid exceeding request size limits
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);
      
      // Format businesses for database insertion
      const dbBusinesses = batch.map(business => ({
        name: business.name,
        website: business.website,
        score: business.score || 50,
        status: business.status || 'discovered', // Ensure status is set
        last_checked: new Date().toISOString()
      }));
      
      // Insert businesses
      batches.push(
        supabase
          .from('businesses')
          .upsert(dbBusinesses, {
            onConflict: 'website',
            ignoreDuplicates: true
          })
      );
    }
    
    await Promise.all(batches);
    console.log(`Saved ${businesses.length} businesses to database`);
  } catch (error) {
    console.error('Error saving businesses to database:', error);
  }
}

/**
 * Generate mock businesses for testing
 */
function generateMockBusinesses(location: string, count: number): Business[] {
  const businesses: Business[] = [];
  
  for (let i = 0; i < count; i++) {
    businesses.push({
      id: `mock-${i}`,
      name: `Business ${i + 1}`,
      website: `business${i + 1}.com`,
      location: location,
      status: 'discovered', // Required status field
      score: Math.floor(Math.random() * 100),
      updated_at: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    });
  }
  
  return businesses;
}

// Updated stub implementation for scanWithBuiltWith
export async function scanWithBuiltWith(businessId: string, website: string) {
  console.warn('BuiltWith scanning is deprecated');
  return { 
    success: false,
    cms: null,
    isMobileFriendly: undefined
  };
}

// Stub implementations for compatibility with existing code
export async function scanWithLighthouse(businessId: string, website: string) {
  console.warn('Lighthouse scanning is deprecated');
  return null;
}

export async function scanWithGTmetrix(businessId: string, website: string) {
  console.warn('GTmetrix scanning is deprecated');
  return null;
}

export async function getBusinessesNeedingRealScores() {
  console.warn('Score estimation is deprecated');
  return [];
}

export async function getGTmetrixUsage() {
  console.warn('GTmetrix usage tracking is deprecated');
  return { used: 0, limit: 0 };
}
