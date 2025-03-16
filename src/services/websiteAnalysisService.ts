
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';
import { generateIssues } from './businessUtilsService';

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
    
    // Map database fields to Business type with proper aliasing
    return data.map(business => ({
      ...business,
      status: business.status || 'discovered',
      lastChecked: business.last_checked,
      speedScore: business.speed_score,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      lighthouseReportUrl: business.lighthouse_report_url,
      gtmetrixReportUrl: business.gtmetrix_report_url,
      lastLighthouseScan: business.last_lighthouse_scan,
      lastGtmetrixScan: business.last_gtmetrix_scan,
      issues: generateIssues(business as unknown as Business)
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesNeedingScoring:', error);
    return [];
  }
}

/**
 * Calculate opportunity score for a business website
 */
export function calculateWebsiteOpportunityScore(business: Business): number {
  if (!business) return 0;
  
  let score = 50; // Default base score
  
  // Adjust score based on existing performance metrics
  if (business.lighthouseScore !== undefined) {
    // Lower lighthouse score = more opportunity
    score += Math.round((100 - (business.lighthouseScore || 0)) / 5);
  }
  
  if (business.gtmetrixScore !== undefined) {
    // Lower GTmetrix score = more opportunity
    score += Math.round((100 - (business.gtmetrixScore || 0)) / 5);
  }
  
  // Factor in website issues
  if (business.issues) {
    if (business.issues.speedIssues) score += 10;
    if (business.issues.outdatedCMS) score += 15;
    if (business.issues.noSSL) score += 20;
    if (business.issues.notMobileFriendly) score += 15;
    if (business.issues.badFonts) score += 5;
  }
  
  // Cap the score at 100
  return Math.min(score, 100);
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
      const opportunityScore = calculateWebsiteOpportunityScore(business);
      
      // Update in database
      const { error } = await supabase
        .from('businesses')
        .update({
          opportunity_score: opportunityScore,
          opportunity_calculated_at: new Date().toISOString()
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
    
    // Map database fields to Business type with proper aliasing
    return data.map(business => ({
      ...business,
      status: business.status || 'discovered',
      lastChecked: business.last_checked,
      speedScore: business.speed_score,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      lighthouseReportUrl: business.lighthouse_report_url,
      gtmetrixReportUrl: business.gtmetrix_report_url,
      lastLighthouseScan: business.last_lighthouse_scan,
      lastGtmetrixScan: business.last_gtmetrix_scan,
      issues: generateIssues(business as unknown as Business)
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesForAnalysis:', error);
    toast.error('Failed to load businesses for analysis');
    return [];
  }
}
