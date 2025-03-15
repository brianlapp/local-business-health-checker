
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { scanBusinessesInArea } from '../scanningService';
import { processScrapedBusinesses } from '../businessProcessingService';
import { handleScanError } from '../scanning/scanningUtils';

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
      'tech', 'software', 'systems', 'IT', 'technology', 'interactive',
      'studio', 'partners', 'group', 'collective', 'innovation'
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
        status: 'new',
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
export async function analyzeAgencyPortfolio(website: string): Promise<{
  clients: Business[];
  portfolioLinks: string[];
  requestUrl?: string;
  error?: string;
}> {
  try {
    console.log(`Analyzing portfolio for agency website: ${website}`);

    // Format the website URL properly 
    const websiteUrl = website.startsWith('http') ? website : `https://${website}`;
    
    // Check common portfolio page patterns
    const portfolioUrls = [
      `${websiteUrl}/portfolio`,
      `${websiteUrl}/clients`,
      `${websiteUrl}/work`,
      `${websiteUrl}/case-studies`,
      `${websiteUrl}/projects`
    ];
    
    // We'll track any portfolio links we find
    const portfolioLinks: string[] = [];
    const clients: Business[] = [];
    
    // For now, return basic response - this would use web scraping in a full implementation
    // In the future, this would actually crawl the agency site to find client logos or mentions
    
    return {
      clients,
      portfolioLinks,
      requestUrl: portfolioUrls[0],
      error: 'Full portfolio analysis not yet implemented'
    };
  } catch (error: any) {
    console.error('Error analyzing agency portfolio:', error);
    toast.error('Failed to analyze agency portfolio');
    return {
      clients: [],
      portfolioLinks: [],
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Get agencies that might be competitors in a specific location
 */
export async function findCompetitorAgencies(location: string, specialties: string[] = []): Promise<Business[]> {
  try {
    // Find agencies in the specified location
    const agencies = await findAgencies(location);
    
    // If specialties are provided, filter agencies by those that match
    if (specialties.length > 0) {
      return agencies.filter(agency => {
        // Check if agency name or industry contains any of the specialties
        const agencyText = `${agency.name} ${agency.industry || ''}`.toLowerCase();
        return specialties.some(specialty => 
          agencyText.includes(specialty.toLowerCase())
        );
      });
    }
    
    return agencies;
  } catch (error) {
    console.error('Error finding competitor agencies:', error);
    toast.error('Failed to find competitor agencies');
    return [];
  }
}
