import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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
          businesses = await getMockBusinessData(location, 'fallback');
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
        businesses: await getMockBusinessData(location, 'error-fallback'),
        count: (await getMockBusinessData(location, 'error-fallback')).length,
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
        const mockBusinesses = await processMockBusinesses(data.businesses, location);
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
      const mockBusinesses = await processMockBusinesses(data.businesses, location);
      return mockBusinesses;
    }
    
    // Otherwise process the scraped businesses
    return await processScrapedBusinesses(data.businesses, source, location);
  } catch (error: any) {
    console.error('Error in web scraper scan:', error);
    throw error;
  }
}

// Process businesses from web scraper
const processScrapedBusinesses = async (scrapedBusinesses: any[], source: string, location: string): Promise<Business[]> => {
  console.log(`Processing ${scrapedBusinesses.length} scraped businesses for ${location}`);
  
  // Process and store the discovered businesses
  const businesses: Business[] = [];
  
  for (const business of scrapedBusinesses) {
    try {
      // Check if business already exists
      const { data: existingBusinesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('website', business.website)
        .limit(1);
        
      if (existingBusinesses && existingBusinesses.length > 0) {
        console.log(`Business already exists: ${business.name}`);
        continue; // Skip existing businesses
      }
      
      // Calculate initial score
      const score = Math.floor(Math.random() * 100);
      
      // Create new business with database schema column names
      // Remove source property as it doesn't exist in the database schema
      const newBusiness: Partial<Business> = {
        id: uuidv4(),
        name: business.name,
        website: business.website,
        score,
        last_checked: new Date().toISOString(),
      };
      
      console.log(`Adding new business: ${business.name}`);
      
      // Insert business into database
      const { error: insertError } = await supabase
        .from('businesses')
        .insert(newBusiness);
        
      if (insertError) {
        console.error(`Error inserting business ${business.name}:`, insertError);
      } else {
        // Add frontend property aliases and source for display only (not stored in DB)
        businesses.push({
          ...newBusiness,
          lastChecked: newBusiness.last_checked,
          issues: generateIssues(newBusiness as Business),
          source: source // Set source for UI display purposes
        } as Business);
      }
    } catch (err) {
      console.error('Error processing business:', err);
    }
  }
  
  console.log(`Successfully added ${businesses.length} new businesses`);
  return businesses;
};

// Process mock businesses without saving them to database (demo mode)
const processMockBusinesses = (mockBusinesses: any[], location: string): Promise<Business[]> => {
  console.log(`Processing ${mockBusinesses.length} mock businesses for ${location}`);
  
  const businesses = mockBusinesses.map(business => {
    const score = Math.floor(Math.random() * 100);
    const now = new Date().toISOString();
    
    const mockBusiness: Business = {
      id: `mock-${uuidv4()}`, // Add 'mock-' prefix to ID to identify mock data
      name: business.name,
      website: business.website,
      score,
      last_checked: now,
      lastChecked: now,
      source: 'mock-data', // Set source for UI display purposes
      issues: {
        speedIssues: score > 50,
        outdatedCMS: Math.random() > 0.5,
        noSSL: !business.website.includes('https'),
        notMobileFriendly: Math.random() > 0.6,
        badFonts: Math.random() > 0.7
      }
    };
    
    return mockBusiness;
  });
  
  return Promise.resolve(businesses);
};

// Function to generate mock business data as fallback
function getMockBusinessData(location: string, source: string = 'mock'): Business[] {
  console.log(`Generating mock data for ${location}`);
  
  // Generate 5-10 mock businesses
  const count = Math.floor(Math.random() * 6) + 5;
  const businesses: Business[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = `${location} Business ${i + 1}`;
    const website = `business${i + 1}.com`;
    const score = Math.floor(Math.random() * 100);
    const now = new Date().toISOString();
    
    businesses.push({
      id: `mock-${uuidv4()}`,
      name,
      website,
      score,
      last_checked: now,
      lastChecked: now,
      source,
      issues: {
        speedIssues: score < 50,
        outdatedCMS: Math.random() > 0.5,
        noSSL: Math.random() > 0.7,
        notMobileFriendly: Math.random() > 0.6,
        badFonts: Math.random() > 0.7
      }
    });
  }
  
  return businesses;
}

export interface AddBusinessPayload {
  name: string;
  website: string;
}

export const addBusiness = async (payload: AddBusinessPayload): Promise<Business> => {
  try {
    // Format website (remove http/https)
    const website = payload.website.replace(/^https?:\/\//, '');
    
    // Check if business already exists
    const { data: existingBusinesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('website', website)
      .limit(1);
      
    if (existingBusinesses && existingBusinesses.length > 0) {
      const business = existingBusinesses[0] as Business;
      return {
        ...business,
        lastChecked: business.last_checked,
        speedScore: business.speed_score,
        lighthouseScore: business.lighthouse_score,
        gtmetrixScore: business.gtmetrix_score,
        lighthouseReportUrl: business.lighthouse_report_url,
        gtmetrixReportUrl: business.gtmetrix_report_url,
        lastLighthouseScan: business.last_lighthouse_scan,
        lastGtmetrixScan: business.last_gtmetrix_scan,
        issues: generateIssues(business),
        source: 'manual' // Set source for UI display purposes
      };
    }
    
    // Generate a random score
    const score = Math.floor(Math.random() * 100);
    
    // Create new business with correct column names
    const newBusiness: Partial<Business> = {
      id: uuidv4(),
      name: payload.name,
      website,
      score,
      last_checked: new Date().toISOString(),
    };
    
    // Insert business into database
    const { error: insertError } = await supabase
      .from('businesses')
      .insert(newBusiness);
      
    if (insertError) throw new Error(insertError.message);
    
    return {
      ...newBusiness as Business,
      lastChecked: newBusiness.last_checked,
      issues: generateIssues(newBusiness as Business),
      source: 'manual' // Set source for UI display purposes
    };
  } catch (error) {
    console.error('Error adding business:', error);
    throw error;
  }
};

export const getBusinesses = async (): Promise<Business[]> => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*');

    if (error) {
      console.error('Error fetching businesses:', error);
      return [];
    }

    // Map database results to include frontend properties
    return data.map(business => ({
      ...business,
      lastChecked: business.last_checked,
      speedScore: business.speed_score,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      lighthouseReportUrl: business.lighthouse_report_url,
      gtmetrixReportUrl: business.gtmetrix_report_url,
      lastLighthouseScan: business.last_lighthouse_scan,
      lastGtmetrixScan: business.last_gtmetrix_scan,
      issues: generateIssues(business)
    }));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};

// Helper function to generate issues for a business
function generateIssues(business: Business) {
  // Use lighthouseScore as primary, fallback to speedScore, or default to 0
  const speedScore = business.lighthouseScore || business.speedScore || 0;
  
  return {
    speedIssues: speedScore < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: Math.random() > 0.5, // Example placeholder
    badFonts: Math.random() > 0.7, // Example placeholder
  };
}

function isCMSOutdated(cms: string | null | undefined): boolean {
  if (!cms) return false;
  
  const outdatedCMSList = [
    'WordPress 5.4', 'WordPress 5.5', 'WordPress 5.6',
    'Joomla 3.8', 'Joomla 3.9',
    'Drupal 7', 'Drupal 8'
  ];
  
  return outdatedCMSList.some(outdatedCMS => cms.includes(outdatedCMS));
}

function isWebsiteSecure(website: string): boolean {
  return website.startsWith('https://') || !website.startsWith('http://');
}
