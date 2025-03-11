import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Function to scan businesses in a geographic area using web scraping
export const scanBusinessesInArea = async (location: string, source: string = 'yellowpages', debugMode: boolean = false): Promise<Business[] | BusinessScanResponse> => {
  try {
    console.log(`Scanning businesses in ${location} using ${source} scraper with debug mode: ${debugMode ? 'ON' : 'OFF'}`);
    
    // Show toast to user
    const toastId = toast.loading(`Scanning for businesses in ${location}...`);
    
    // Call the edge function to scrape for businesses with a timeout
    const timeoutMs = 35000; // 35 seconds timeout (edge functions have 60s max)
    
    try {
      // Set up AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Call the edge function with debug mode parameter
      // Note: Supabase SDK doesn't support the signal property for edge functions
      // We'll handle the timeout differently
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { location, source, debug: debugMode }
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Edge function error:', error);
        toast.error(`Error searching for businesses: ${error.message || 'Failed to search for businesses'}`, {
          id: toastId
        });
        return [];
      }
      
      console.log('Web scraper response:', data);
      
      // Handle new response format which includes businesses array
      if (data && data.businesses && Array.isArray(data.businesses)) {
        // Check if debug info was returned and log it
        if (debugMode && data.debugInfo) {
          console.log('Debug info:', data.debugInfo);
          if (data.debugInfo.logs) {
            console.log('Debug logs:', data.debugInfo.logs);
          }
        }
        
        const processedBusinesses = await processScrapedBusinesses(data.businesses, source, location);
        
        toast.success(`Found ${processedBusinesses.length} businesses in ${location}`, {
          id: toastId
        });
        
        // Return the full response with debug info if in debug mode
        if (debugMode && data.debugInfo) {
          return {
            businesses: processedBusinesses,
            count: processedBusinesses.length,
            location,
            source,
            timestamp: new Date().toISOString(),
            debugInfo: data.debugInfo as ScanDebugInfo
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
          
          toast.success(`Found ${mockBusinesses.length} sample businesses in ${location}`, {
            id: toastId
          });
          
          return mockBusinesses;
        }
        
        toast.error(data.message || data.error, {
          id: toastId
        });
        
        throw new Error(data.message || data.error);
      }
      
      // If no businesses found
      if (!data.businesses || data.businesses.length === 0) {
        toast.error(`No businesses found in ${location}`, {
          id: toastId
        });
        return [];
      }
      
      // If it's mock data
      if (data.mockData) {
        const mockBusinesses = await processMockBusinesses(data.businesses, location);
        
        toast.success(`Found ${mockBusinesses.length} sample businesses in ${location}`, {
          id: toastId
        });
        
        return mockBusinesses;
      }
      
      // Otherwise process the scraped businesses
      const businesses = await processScrapedBusinesses(data.businesses, source, location);
      
      toast.success(`Found ${businesses.length} businesses in ${location}`, {
        id: toastId
      });
      
      return businesses;
    } catch (fetchError: any) {
      // Handle AbortError/timeout specifically
      if (fetchError.name === 'AbortError') {
        console.error('Edge function timeout after', timeoutMs, 'ms');
        toast.error(`The search timed out. Try searching with "localstack" source or a different location.`, {
          id: toastId
        });
        return getMockBusinessData(location, 'timeout-fallback');
      }
      
      console.error('Edge function fetch error:', fetchError);
      toast.error(`Failed to search for businesses: ${fetchError.message}`, {
        id: toastId
      });
      return [];
    }
  } catch (error: any) {
    console.error('Error scanning businesses:', error);
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`);
    return [];
  }
};

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
  // Use lighthouse_score as primary, fallback to speed_score, or default to 0
  const speedScore = business.lighthouse_score || business.speed_score || 0;
  
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
