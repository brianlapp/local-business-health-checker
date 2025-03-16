
// File: src/services/websiteAnalysisService.ts
// Analyze websites for issues and technical insights

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { generateIssues } from './businessUtilsService';

// Update the database with new website analysis results
export async function updateWebsiteAnalysis(businessId: string, analysisData: {
  lighthouseScore?: number;
  speedScore?: number;
  gtmetrixScore?: number;
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  cms?: string;
  is_mobile_friendly?: boolean;
}): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    const updateData: any = {};
    
    // Add fields to update data if they exist
    if (analysisData.lighthouseScore !== undefined) {
      updateData.lighthouse_score = analysisData.lighthouseScore;
      updateData.last_lighthouse_scan = now;
    }
    
    if (analysisData.speedScore !== undefined) {
      updateData.speed_score = analysisData.speedScore;
    }
    
    if (analysisData.gtmetrixScore !== undefined) {
      updateData.gtmetrix_score = analysisData.gtmetrixScore;
      updateData.last_gtmetrix_scan = now;
    }
    
    if (analysisData.lighthouseReportUrl) {
      updateData.lighthouse_report_url = analysisData.lighthouseReportUrl;
    }
    
    if (analysisData.gtmetrixReportUrl) {
      updateData.gtmetrix_report_url = analysisData.gtmetrixReportUrl;
    }
    
    if (analysisData.cms) {
      updateData.cms = analysisData.cms;
    }
    
    if (analysisData.is_mobile_friendly !== undefined) {
      updateData.is_mobile_friendly = analysisData.is_mobile_friendly;
    }
    
    // Always update last_checked timestamp
    updateData.last_checked = now;
    
    const { error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId);
    
    if (error) {
      console.error('Error updating website analysis:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateWebsiteAnalysis:', error);
    return false;
  }
}

// Get scan usage statistics for GTmetrix
export async function getGTMetrixUsage(): Promise<{ used: number, limit: number, resetDate: string | null }> {
  try {
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching GTmetrix usage:', error);
      return { used: 0, limit: 0, resetDate: null };
    }
    
    return {
      used: data.scans_used,
      limit: data.scans_limit,
      resetDate: data.reset_date
    };
  } catch (error) {
    console.error('Error in getGTMetrixUsage:', error);
    return { used: 0, limit: 0, resetDate: null };
  }
}

// Increment GTmetrix usage counter
export async function incrementGTMetrixUsage(): Promise<boolean> {
  try {
    // Get current usage
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching GTmetrix usage:', error);
      return false;
    }
    
    // Update usage count
    const { error: updateError } = await supabase
      .from('gtmetrix_usage')
      .update({
        scans_used: data.scans_used + 1,
        last_updated: new Date().toISOString()
      })
      .eq('id', data.id);
    
    if (updateError) {
      console.error('Error updating GTmetrix usage:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in incrementGTMetrixUsage:', error);
    return false;
  }
}

// Get all businesses that need analysis
export async function getBusinessesForAnalysis(limit: number = 10): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('last_checked', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching businesses for analysis:', error);
      return [];
    }
    
    // Ensure proper return type with required fields
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
      status: business.status || 'discovered',
      issues: generateIssues(business as unknown as Business)
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesForAnalysis:', error);
    return [];
  }
}

// Calculate SEO issues based on business data
export function calculateSEOIssues(business: Business): string[] {
  const issues: string[] = [];
  
  // Check for performance issues
  if (business.lighthouseScore !== undefined && business.lighthouseScore < 50) {
    issues.push('Poor performance');
  }
  
  // Check for mobile-friendliness
  if (business.is_mobile_friendly === false) {
    issues.push('Not mobile-friendly');
  }
  
  // Check for SSL/HTTPS
  if (business.website && !business.website.includes('https')) {
    issues.push('No SSL certificate');
  }
  
  // Check for outdated CMS
  if (business.cms) {
    const lowerCms = business.cms.toLowerCase();
    if (
      lowerCms.includes('wordpress 4') || 
      lowerCms.includes('wordpress 5.0') || 
      lowerCms.includes('joomla 3') || 
      lowerCms.includes('drupal 7')
    ) {
      issues.push('Outdated CMS');
    }
  }
  
  // Add more checks as needed
  
  return issues;
}

// Calculate opportunity score based on business data
export async function calculateWebsiteOpportunityScore(business: Business): Promise<number> {
  try {
    // Base score
    let score = 50;
    
    // Add points for poor lighthouse score (higher opportunity)
    if (business.lighthouseScore !== undefined) {
      if (business.lighthouseScore < 30) score += 25;
      else if (business.lighthouseScore < 50) score += 20;
      else if (business.lighthouseScore < 70) score += 10;
      else if (business.lighthouseScore > 90) score -= 15;
    }
    
    // Add points for not being mobile-friendly
    if (business.is_mobile_friendly === false) {
      score += 15;
    }
    
    // Add points for no SSL
    if (business.website && !business.website.includes('https')) {
      score += 10;
    }
    
    // Add points for outdated CMS
    if (business.cms) {
      const lowerCms = business.cms.toLowerCase();
      if (
        lowerCms.includes('wordpress 4') || 
        lowerCms.includes('wordpress 5.0') || 
        lowerCms.includes('joomla 3') || 
        lowerCms.includes('drupal 7')
      ) {
        score += 15;
      }
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    // Update the database with the new score
    await supabase
      .from('businesses')
      .update({ score })
      .eq('id', business.id);
    
    return score;
  } catch (error) {
    console.error('Error calculating opportunity score:', error);
    return business.score || 50;
  }
}

// Get businesses that need opportunity scoring
export async function getBusinessesNeedingScoring(): Promise<Business[]> {
  try {
    // Get businesses that have been scanned but don't have a score
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .or('score.is.null,lighthouse_score.not.is.null')
      .limit(50);
    
    if (error) {
      console.error('Error fetching businesses needing scoring:', error);
      return [];
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
      status: business.status || 'discovered',
      issues: generateIssues(business as unknown as Business)
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesNeedingScoring:', error);
    return [];
  }
}

// Process opportunity scores for multiple businesses
export async function processBusinessOpportunityScores(businesses: Business[]): Promise<void> {
  try {
    for (const business of businesses) {
      await calculateWebsiteOpportunityScore(business);
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Error processing opportunity scores:', error);
    throw error;
  }
}
