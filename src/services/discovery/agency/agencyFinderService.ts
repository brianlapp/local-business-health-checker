
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { scanBusinessesInArea } from '../../scanningService';
import { processScrapedBusinesses } from '../../businessProcessingService';
import { handleScanError } from '../../scanning/scanningUtils';
import { 
  addAgencyToDatabase, 
  getAgenciesFromDatabase,
  filterPotentialAgencies
} from './agencyDatabaseService';
import { analyzeAgencyPortfolioImpl } from './agencyPortfolioService';

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
    const potentialAgencies = filterPotentialAgencies(response.businesses);
    
    console.log(`Found ${potentialAgencies.length} potential agencies`);
    
    // Mark these businesses as potential agencies in their metadata
    const enhancedAgencies = potentialAgencies.map(agency => ({
      ...agency,
      industry: agency.industry || 'Digital Agency',
      status: 'discovered' as const,
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
  return addAgencyToDatabase(agency);
}

/**
 * Get all agencies from the database
 */
export async function getAgencies(): Promise<Business[]> {
  return getAgenciesFromDatabase();
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
  return analyzeAgencyPortfolioImpl(website);
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
