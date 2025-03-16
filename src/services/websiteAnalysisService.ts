import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';
import { generateIssues, ensureBusinessStatus, ensureBusinessesStatus } from './businessUtilsService';

/**
 * Get businesses that need to have their opportunity score calculated
 */
export async function getBusinessesNeedingScoring(): Promise<Business[]> {
  try {
    console.log('Fetching businesses needing scoring');
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .is('opportunity_score', null)
      .not('website', 'eq', '');
    
    if (error) {
      console.error('Error fetching businesses for scoring:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} businesses needing scoring`);
    
    // Use the utility function to ensure all businesses have proper status
    return ensureBusinessesStatus(data);
  } catch (error) {
    console.error('Error in getBusinessesNeedingScoring:', error);
    return [];
  }
}

/**
 * Calculate opportunity score for a business website
 */
export async function calculateOpportunityScore(business: any): Promise<number> {
  try {
    // Various calculations...
    
    // Make sure we're returning the actual number, not a Promise
    let finalScore = 0;
    
    // Calculate score based on various factors
    if (business.lighthouse_score) {
      finalScore += business.lighthouse_score * 0.3; // 30% weight to performance
    }
    
    if (business.gtmetrix_score) {
      finalScore += business.gtmetrix_score * 0.2; // 20% weight to GTMetrix
    }
    
    // Add weights for other factors
    
    // Ensure we return a number between 0 and 100
    return Math.min(100, Math.max(0, Math.round(finalScore)));
  } catch (error) {
    console.error('Error calculating opportunity score:', error);
    return 50; // Default score if calculation fails
  }
}

/**
 * Calculate SEO issues for a business website
 */
export function calculateSEOIssues(business: Business): {
  hasSEOIssues: boolean;
  issueCount: number;
  specificIssues: string[];
} {
  const specificIssues: string[] = [];
  
  // Check for SSL issues
  if (business.issues?.noSSL) {
    specificIssues.push('Missing SSL certificate');
  }
  
  // Check for mobile friendliness
  if (business.issues?.notMobileFriendly || business.is_mobile_friendly === false) {
    specificIssues.push('Not mobile-friendly');
  }
  
  // Check for speed issues
  if (business.issues?.speedIssues || (business.lighthouseScore && business.lighthouseScore < 70)) {
    specificIssues.push('Slow page speed');
  }
  
  // Check for CMS issues
  if (business.issues?.outdatedCMS) {
    specificIssues.push('Outdated CMS version');
  }
  
  return {
    hasSEOIssues: specificIssues.length > 0,
    issueCount: specificIssues.length,
    specificIssues
  };
}

/**
 * Process and save opportunity scores for multiple businesses
 */
export async function processBusinessOpportunityScores(businesses: Business[]): Promise<number> {
  let successCount = 0;
  
  for (const business of businesses) {
    try {
      // Calculate opportunity score
      const opportunityScore = await calculateOpportunityScore(business);
      
      // Update in database
      const { error } = await supabase
        .from('businesses')
        .update({ 
          opportunity_score: opportunityScore,
          opportunity_calculated_at: new Date().toISOString(),
          status: business.status || 'discovered',
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);
      
      if (error) {
        console.error(`Error updating opportunity score for ${business.name}:`, error);
        continue;
      }
      
      successCount++;
    } catch (err) {
      console.error(`Error processing opportunity score for ${business.name}:`, err);
    }
  }
  
  return successCount;
}

/**
 * Get businesses for website analysis
 */
export async function getBusinessesForAnalysis(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('last_checked', { ascending: true })
      .limit(50);
    
    if (error) {
      throw error;
    }
    
    // Use the utility function to ensure all businesses have proper status and shape
    return ensureBusinessesStatus(data);
  } catch (error) {
    console.error('Error in getBusinessesForAnalysis:', error);
    toast.error('Failed to load businesses for analysis');
    return [];
  }
}

/**
 * Update a business with a calculated opportunity score
 */
export async function updateBusinessWithOpportunityScore(businessId: string): Promise<any> {
  try {
    // Get the business
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
    
    if (!business) {
      throw new Error('Business not found');
    }
    
    // Calculate the opportunity score - make sure to await the Promise
    const opportunityScore = await calculateOpportunityScore(business);
    
    // Update the business with the new opportunity_score
    const { data: updatedBusiness, error } = await supabase
      .from('businesses')
      .update({
        opportunity_score: opportunityScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return ensureBusinessStatus(updatedBusiness);
  } catch (error) {
    console.error('Error updating business with opportunity score:', error);
    return null;
  }
}
