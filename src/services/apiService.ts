import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { v4 as uuidv4 } from 'uuid';

// Function to scan businesses in a geographic area
export const scanBusinessesInArea = async (location: string, radius: number): Promise<Business[]> => {
  try {
    // Call the edge function to search for businesses
    const { data, error } = await supabase.functions.invoke('google-maps-search', {
      body: { location, radius },
    });
    
    if (error) throw new Error(error.message);
    
    // Process and store the discovered businesses
    const businesses: Business[] = [];
    
    for (const business of data.businesses) {
      // Skip businesses without websites
      if (!business.website) continue;
      
      // Format website (remove http/https)
      const website = business.website.replace(/^https?:\/\//, '');
      
      // Check if business already exists
      const { data: existingBusinesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('website', website)
        .limit(1);
        
      if (existingBusinesses && existingBusinesses.length > 0) {
        continue; // Skip existing businesses
      }
      
      // Calculate initial score
      const score = Math.floor(Math.random() * 100);
      
      // Create new business
      const newBusiness: Partial<Business> = {
        id: uuidv4(),
        name: business.name,
        website,
        score,
        lastChecked: new Date().toISOString(),
        issues: {
          speedIssues: score > 50,
          outdatedCMS: score > 40,
          noSSL: score > 70,
          notMobileFriendly: score > 60,
          badFonts: score > 30,
        }
      };
      
      // Insert business into database
      const { error: insertError } = await supabase
        .from('businesses')
        .insert(newBusiness);
        
      if (!insertError) {
        businesses.push(newBusiness as Business);
      }
    }
    
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
      return existingBusinesses[0] as Business;
    }
    
    // For now, generate a random score
    // In a real implementation, we would scan the website to determine the score
    const score = Math.floor(Math.random() * 100);
    
    // Create new business
    const newBusiness: Partial<Business> = {
      id: uuidv4(),
      name: payload.name,
      website,
      score,
      lastChecked: new Date().toISOString(),
      issues: {
        speedIssues: score > 50,
        outdatedCMS: score > 40,
        noSSL: score > 70,
        notMobileFriendly: score > 60,
        badFonts: score > 30,
      }
    };
    
    // Insert business into database
    const { error: insertError } = await supabase
      .from('businesses')
      .insert(newBusiness);
      
    if (insertError) throw new Error(insertError.message);
    
    return newBusiness as Business;
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

    return data as Business[];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};
