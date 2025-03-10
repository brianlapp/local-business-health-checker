
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { v4 as uuidv4 } from 'uuid';

// Function to scan businesses in a geographic area
export const scanBusinessesInArea = async (location: string, radius: number): Promise<Business[]> => {
  try {
    console.log(`Scanning businesses in ${location} with radius ${radius}km`);
    
    // Call the edge function to search for businesses
    const { data, error } = await supabase.functions.invoke('google-maps-search', {
      body: { location, radius },
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to search for businesses');
    }
    
    console.log('Google Maps search response:', data);
    
    if (!data.businesses || data.businesses.length === 0) {
      console.log('No businesses found in the area');
      return [];
    }
    
    // Process and store the discovered businesses
    const businesses: Business[] = [];
    
    for (const business of data.businesses) {
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
        // Add frontend property aliases
        businesses.push({
          ...newBusiness,
          lastChecked: newBusiness.last_checked,
          issues: generateIssues(newBusiness as Business)
        } as Business);
      }
    }
    
    console.log(`Successfully added ${businesses.length} new businesses`);
    return businesses;
  } catch (error) {
    console.error('Error scanning businesses:', error);
    throw error;
  }
};

// Function to add a business manually
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
        issues: generateIssues(business)
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
      issues: generateIssues(newBusiness as Business)
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
