import { Business } from '@/types/business';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Calculate an opportunity score based on website quality factors
 */
export async function calculateWebsiteOpportunityScore(business: Business): Promise<number> {
  try {
    // Start with a base score
    let score = 50;
    
    // Factor 1: Performance issues
    if (business.lighthouse_score !== undefined || business.lighthouseScore !== undefined) {
      const lighthouseScore = business.lighthouse_score || business.lighthouseScore || 0;
      
      // Poor performance means more opportunity to help
      if (lighthouseScore < 50) {
        score += 20;
      } else if (lighthouseScore < 70) {
        score += 10;
      }
    }
    
    // Factor 2: CMS status
    if (business.cms) {
      const outdatedCms = isOutdatedCMS(business.cms);
      if (outdatedCms) {
        score += 15; // Outdated CMS = opportunity
      }
    }
    
    // Factor 3: Mobile friendliness
    if (business.is_mobile_friendly === false) {
      score += 25; // Not mobile friendly = big opportunity
    }
    
    // Factor 4: Website speed
    if (business.gtmetrix_score !== undefined || business.gtmetrixScore !== undefined) {
      const speedScore = business.gtmetrix_score || business.gtmetrixScore || 0;
      
      if (speedScore < 40) {
        score += 20; // Very slow site = opportunity
      } else if (speedScore < 60) {
        score += 10; // Somewhat slow site = some opportunity
      }
    }
    
    // Cap the score at 100
    score = Math.min(score, 100);
    
    // Update the business with the calculated score
    await updateBusinessScore(business.id, score);
    
    return score;
  } catch (error) {
    console.error('Error calculating website opportunity score:', error);
    return 50; // Default score on error
  }
}

/**
 * Update a business's opportunity score in the database
 */
async function updateBusinessScore(businessId: string, score: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({ score })
      .eq('id', businessId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating business score:', error);
    toast.error('Failed to update business score');
  }
}

/**
 * Determine if a CMS is considered outdated or problematic
 */
export function isOutdatedCMS(cms: string): boolean {
  const lowerCms = cms.toLowerCase();
  
  // List of CMS platforms considered outdated or problematic
  const outdatedCmsList = [
    'wordpress 4', 
    'wordpress 5.0', 
    'wordpress 5.1', 
    'wordpress 5.2', 
    'wordpress 5.3', 
    'wordpress 5.4',
    'drupal 7',
    'joomla 3',
    'magento 1',
    'wix',  // Include Wix as it often has limitations for professional development
  ];
  
  return outdatedCmsList.some(outdatedCms => lowerCms.includes(outdatedCms));
}

/**
 * Process a batch of businesses to calculate and update their opportunity scores
 */
export async function processBusinessOpportunityScores(businesses: Business[]): Promise<void> {
  try {
    let updatedCount = 0;
    
    for (const business of businesses) {
      await calculateWebsiteOpportunityScore(business);
      updatedCount++;
    }
    
    toast.success(`Updated opportunity scores for ${updatedCount} businesses`);
  } catch (error) {
    console.error('Error processing business opportunity scores:', error);
    toast.error('Failed to process business opportunity scores');
  }
}

/**
 * Get businesses that need scoring
 */
export async function getBusinessesNeedingScoring(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .or('score.is.null,lighthouse_score.not.is.null,gtmetrix_score.not.is.null')
      .order('last_checked', { ascending: false })
      .limit(20);
    
    if (error) {
      throw error;
    }
    
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
      is_mobile_friendly: business.is_mobile_friendly,
      status: business.status || 'discovered', // Ensure status is set
      issues: generateIssues(business),
    }));
  } catch (error) {
    console.error('Error fetching businesses needing scoring:', error);
    return [];
  }
}

/**
 * Calculate SEO issues based on a business's website metrics
 */
export function calculateSEOIssues(business: Business): string[] {
  const issues: string[] = [];
  
  // Performance issues
  if ((business.lighthouse_score || business.lighthouseScore || 0) < 70) {
    issues.push('Poor website performance');
  }
  
  // Speed issues
  if ((business.gtmetrix_score || business.gtmetrixScore || 0) < 60) {
    issues.push('Slow page loading speed');
  }
  
  // Mobile issues
  if (business.is_mobile_friendly === false) {
    issues.push('Not mobile-friendly');
  }
  
  // CMS issues
  if (business.cms && isOutdatedCMS(business.cms)) {
    issues.push('Outdated CMS platform');
  }
  
  return issues;
}

// Import generateIssues function
import { generateIssues } from './businessUtilsService';
