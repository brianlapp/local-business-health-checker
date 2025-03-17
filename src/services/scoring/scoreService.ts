
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type OpportunityScore = {
  id: string;
  name: string;
  website: string;
  lighthouseScore: number | null;
  gtmetrixScore: number | null;
  opportunityScore: number | null;
  lastChecked: string | null;
  cms: string | null;
  isMobileFriendly: boolean | null;
};

/**
 * Get businesses that need opportunity scores calculated
 */
export async function getBusinessesNeedingScores(): Promise<OpportunityScore[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, website, lighthouse_score, gtmetrix_score, opportunity_score, last_checked, cms, is_mobile_friendly')
      .is('opportunity_score', null)
      .not('lighthouse_score', 'is', null)
      .order('last_checked', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching businesses needing scores:', error);
      toast.error('Failed to fetch businesses needing scores');
      return [];
    }
    
    return (data || []).map(business => ({
      id: business.id,
      name: business.name,
      website: business.website,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      opportunityScore: business.opportunity_score,
      lastChecked: business.last_checked,
      cms: business.cms,
      isMobileFriendly: business.is_mobile_friendly
    }));
  } catch (error) {
    console.error('Error in getBusinessesNeedingScores:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

/**
 * Calculate opportunity scores for multiple businesses
 */
export async function calculateOpportunityScores(businessIds: string[]): Promise<OpportunityScore[]> {
  try {
    if (businessIds.length === 0) {
      return [];
    }
    
    // Fetch the businesses to calculate scores for
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, website, lighthouse_score, gtmetrix_score, cms, is_mobile_friendly')
      .in('id', businessIds);
    
    if (error) {
      console.error('Error fetching businesses for scoring:', error);
      toast.error('Failed to fetch businesses for scoring');
      return [];
    }
    
    // Calculate scores and update businesses
    const updatedBusinesses: OpportunityScore[] = [];
    
    for (const business of data || []) {
      // Calculate the opportunity score
      const score = calculateOpportunityScore(business);
      
      // Update the business with the new score
      const { data: updatedBusiness, error: updateError } = await supabase
        .from('businesses')
        .update({
          opportunity_score: score,
          opportunity_calculated_at: new Date().toISOString()
        })
        .eq('id', business.id)
        .select('id, name, website, lighthouse_score, gtmetrix_score, opportunity_score, last_checked, cms, is_mobile_friendly')
        .single();
      
      if (updateError) {
        console.error(`Error updating score for business ${business.id}:`, updateError);
        continue;
      }
      
      updatedBusinesses.push({
        id: updatedBusiness.id,
        name: updatedBusiness.name,
        website: updatedBusiness.website,
        lighthouseScore: updatedBusiness.lighthouse_score,
        gtmetrixScore: updatedBusiness.gtmetrix_score,
        opportunityScore: updatedBusiness.opportunity_score,
        lastChecked: updatedBusiness.last_checked,
        cms: updatedBusiness.cms,
        isMobileFriendly: updatedBusiness.is_mobile_friendly
      });
    }
    
    return updatedBusinesses;
  } catch (error) {
    console.error('Error in calculateOpportunityScores:', error);
    toast.error('Failed to calculate opportunity scores');
    return [];
  }
}

/**
 * Calculate an opportunity score based on business data
 */
function calculateOpportunityScore(business: any): number {
  // Base score starts at 50 (neutral)
  let score = 50;
  
  // Add points for poor Lighthouse scores (lower scores = more opportunity)
  if (business.lighthouse_score !== null) {
    if (business.lighthouse_score < 50) {
      score += 30; // Very poor performance = great opportunity
    } else if (business.lighthouse_score < 70) {
      score += 20; // Poor performance = good opportunity
    } else if (business.lighthouse_score < 90) {
      score += 10; // Average performance = some opportunity
    }
  }
  
  // Add points for poor GTmetrix scores
  if (business.gtmetrix_score !== null) {
    if (business.gtmetrix_score < 50) {
      score += 15;
    } else if (business.gtmetrix_score < 70) {
      score += 10;
    } else if (business.gtmetrix_score < 90) {
      score += 5;
    }
  }
  
  // Add points for outdated CMS
  if (business.cms) {
    const cmsLower = business.cms.toLowerCase();
    if (cmsLower.includes('wordpress')) {
      score += 10; // WordPress sites often need help
    }
    if (cmsLower.includes('joomla') || cmsLower.includes('drupal')) {
      score += 15; // These systems often need more modernization
    }
    if (cmsLower.includes('wix') || cmsLower.includes('squarespace')) {
      score += 5; // Potential for custom solutions
    }
  }
  
  // Add points for not being mobile friendly
  if (business.is_mobile_friendly === false) {
    score += 25; // Not mobile-friendly is a big opportunity
  }
  
  // Cap the score at 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Get opportunity score for a single business
 */
export async function getOpportunityScore(businessId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('opportunity_score')
      .eq('id', businessId)
      .single();
    
    if (error) {
      console.error('Error fetching opportunity score:', error);
      return null;
    }
    
    return data.opportunity_score;
  } catch (error) {
    console.error('Error in getOpportunityScore:', error);
    return null;
  }
}
