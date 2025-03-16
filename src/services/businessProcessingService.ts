
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { v4 as uuidv4 } from 'uuid';
import { generateIssues } from './businessUtilsService';

// Process businesses from web scraper
export const processScrapedBusinesses = async (scrapedBusinesses: any[], source: string, location: string): Promise<Business[]> => {
  console.log(`Processing ${scrapedBusinesses.length} scraped businesses for ${location}`);
  
  // Process and store the discovered businesses
  const businesses: Business[] = [];
  const existingBusinesses: Business[] = [];
  
  // First collect all websites to check at once
  const websites = scrapedBusinesses.map(business => business.website);
  
  // Fetch all existing businesses with these websites in one query
  const { data: existingBusinessData } = await supabase
    .from('businesses')
    .select('*')
    .in('website', websites);
    
  const existingBusinessMap = new Map();
  if (existingBusinessData) {
    existingBusinessData.forEach(business => {
      existingBusinessMap.set(business.website, business);
    });
  }
  
  for (const business of scrapedBusinesses) {
    try {
      // Check if business already exists using our map
      const existingBusiness = existingBusinessMap.get(business.website);
        
      if (existingBusiness) {
        console.log(`Business already exists: ${business.name}`);
        
        // Add the existing business to our results
        existingBusinesses.push({
          ...existingBusiness,
          lastChecked: existingBusiness.last_checked,
          speedScore: existingBusiness.speed_score,
          lighthouseScore: existingBusiness.lighthouse_score,
          gtmetrixScore: existingBusiness.gtmetrix_score,
          lighthouseReportUrl: existingBusiness.lighthouse_report_url,
          gtmetrixReportUrl: existingBusiness.gtmetrix_report_url,
          lastLighthouseScan: existingBusiness.last_lighthouse_scan,
          lastGtmetrixScan: existingBusiness.last_gtmetrix_scan,
          status: existingBusiness.status || 'discovered', // Ensure status is set
          issues: generateIssues(existingBusiness),
          source: source // Set source for UI display purposes
        });
        continue; // Skip to the next business
      }
      
      // Calculate initial score
      const score = Math.floor(Math.random() * 100);
      
      // Create new business with database schema column names
      // Remove source property as it doesn't exist in the database schema
      const newBusiness = {
        id: uuidv4(),
        name: business.name,
        website: business.website,
        score,
        status: 'discovered' as const, // Add required status field
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
          source: source, // Set source for UI display purposes
          status: 'discovered' // Ensure status is set
        } as Business);
      }
    } catch (err) {
      console.error('Error processing business:', err);
    }
  }
  
  // Combine new and existing businesses
  const allBusinesses = [...businesses, ...existingBusinesses];
  
  console.log(`Successfully added ${businesses.length} new businesses and found ${existingBusinesses.length} existing businesses`);
  return allBusinesses;
};

// Process real businesses from API without saving them to database (for preview mode)
export const processPreviewBusinesses = (previewBusinesses: any[], location: string): Promise<Business[]> => {
  console.log(`Processing ${previewBusinesses.length} preview businesses for ${location}`);
  
  const businesses = previewBusinesses.map(business => {
    const score = Math.floor(Math.random() * 100);
    const now = new Date().toISOString();
    
    const previewBusiness: Business = {
      id: uuidv4(),
      name: business.name,
      website: business.website,
      score,
      status: 'discovered', // Add required status field
      last_checked: now,
      lastChecked: now,
      source: 'preview', // Set source for UI display purposes
      issues: {
        speedIssues: score < 50,
        outdatedCMS: false,
        noSSL: !business.website.includes('https'),
        notMobileFriendly: false,
        badFonts: false
      }
    };
    
    return previewBusiness;
  });
  
  return Promise.resolve(businesses);
};

// Function to generate sample business data for preview
export function generateMockBusinessData(locationInput: string): Business[] {
  const location = typeof locationInput === 'string' ? locationInput : 'Unknown';
  console.log(`Generating preview data for ${location}`);
  
  // Generate 5-10 preview businesses
  const count = Math.floor(Math.random() * 6) + 5;
  const businesses: Business[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = `${location} Business ${i + 1}`;
    const website = `https://business${i + 1}.com`;
    const score = Math.floor(Math.random() * 100);
    const now = new Date().toISOString();
    
    businesses.push({
      id: `preview-${uuidv4()}`,
      name,
      website,
      score,
      status: 'discovered', // Add required status field
      last_checked: now,
      lastChecked: now,
      source: 'preview',
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
