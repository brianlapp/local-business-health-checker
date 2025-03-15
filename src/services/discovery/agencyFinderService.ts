
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { scanBusinessesInArea } from '../scanningService';
import { processScrapedBusinesses } from '../businessProcessingService';

/**
 * Find potential agencies in a specific area
 */
export async function findAgencies(location: string): Promise<Business[]> {
  try {
    console.log(`Finding agencies in ${location}`);
    
    // Use existing scanner but with specialized keywords for agencies
    const response = await scanBusinessesInArea(location, 'google', true);
    
    if (!response.businesses || response.businesses.length === 0) {
      console.log('No potential agencies found');
      return [];
    }
    
    // Filter businesses that might be agencies based on name
    const agencyKeywords = [
      'agency', 'digital', 'marketing', 'web', 'design', 'media', 
      'creative', 'studios', 'consulting', 'solutions', 'development',
      'tech', 'software', 'systems', 'IT', 'technology'
    ];
    
    const potentialAgencies = response.businesses.filter(business => {
      if (!business.name) return false;
      
      const lowerName = business.name.toLowerCase();
      return agencyKeywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
    });
    
    console.log(`Found ${potentialAgencies.length} potential agencies`);
    
    // Mark these businesses as potential agencies in their metadata
    // Fix: Explicitly cast status to the allowed union type values
    const enhancedAgencies = potentialAgencies.map(agency => ({
      ...agency,
      industry: agency.industry || 'Digital Agency',
      status: 'discovered' as const, // Explicitly use a valid status value with const assertion
      isAgency: true,
      source: 'agency-finder'
    }));
    
    return enhancedAgencies;
  } catch (error) {
    console.error('Error finding agencies:', error);
    toast.error('Failed to find agencies');
    return [];
  }
}

/**
 * Add an agency to the database
 */
export async function addAgency(agency: Business): Promise<boolean> {
  try {
    console.log('Adding agency to database:', agency.name);
    
    // Add the agency to both businesses and agencies tables
    const { error: businessError } = await supabase
      .from('businesses')
      .upsert({
        name: agency.name,
        website: agency.website,
        status: agency.status || 'discovered',
        industry: agency.industry || 'Digital Agency',
        score: agency.score || 50,
        last_checked: new Date().toISOString(),
        is_agency: true
      }, {
        onConflict: 'website',
        ignoreDuplicates: false
      });
    
    if (businessError) {
      throw businessError;
    }
    
    // Also add to recruitment_agencies table for specialized tracking
    const { error: agencyError } = await supabase
      .from('recruitment_agencies')
      .upsert({
        name: agency.name,
        website: agency.website,
        contact_email: agency.contact_info?.email || null,
        contact_phone: agency.contact_info?.phone || null,
        status: 'discovered',
        notes: `Auto-discovered agency in ${agency.location || 'unknown location'}`
      }, {
        onConflict: 'website',
        ignoreDuplicates: true
      });
    
    if (agencyError) {
      console.warn('Error adding to recruitment_agencies:', agencyError);
      // Continue anyway since we've added to businesses table
    }
    
    toast.success(`Added agency: ${agency.name}`);
    return true;
  } catch (error) {
    console.error('Error adding agency:', error);
    toast.error(`Failed to add agency: ${agency.name}`);
    return false;
  }
}

/**
 * Get all agencies from the database
 */
export async function getAgencies(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_agency', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting agencies:', error);
    toast.error('Failed to load agencies');
    return [];
  }
}

/**
 * Analyze an agency's client list by examining their portfolio
 */
export async function analyzeAgencyPortfolio(agencyId: string, website: string): Promise<string[]> {
  try {
    console.log(`Analyzing portfolio for agency website: ${website}`);
    
    // In a future implementation, this would use web scraping to find client logos or case studies
    // For now, we'll return a placeholder response
    
    toast.info('Agency portfolio analysis is not yet implemented');
    return [];
  } catch (error) {
    console.error('Error analyzing agency portfolio:', error);
    toast.error('Failed to analyze agency portfolio');
    return [];
  }
}
