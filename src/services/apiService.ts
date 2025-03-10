
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface GooglePlaceResult {
  name: string;
  place_id: string;
  formatted_address: string;
  website?: string;
}

export interface PerformanceResult {
  speedScore: number;
  fullyLoadedTime: number;
  reportUrl: string;
  createdAt: string;
}

export interface TechnologyResult {
  cms: string;
  technologies: Array<{
    name: string;
    category: string;
  }>;
  domain: string;
  analyzedAt: string;
}

/**
 * Search for businesses using Google Maps API
 */
export async function searchBusinesses(query: string): Promise<GooglePlaceResult[]> {
  try {
    const { data, error } = await supabase.functions.invoke('google-maps-search', {
      body: { query }
    });

    if (error) throw error;
    
    return data.results || [];
  } catch (error) {
    console.error('Error searching businesses:', error);
    toast.error('Failed to search businesses');
    return [];
  }
}

/**
 * Scan website performance using GTmetrix API
 */
export async function scanWebsitePerformance(url: string): Promise<PerformanceResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('gtmetrix-scan', {
      body: { url }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error scanning website performance:', error);
    toast.error('Failed to scan website performance');
    return null;
  }
}

/**
 * Scan website technology stack using BuiltWith API
 */
export async function scanWebsiteTechnology(website: string): Promise<TechnologyResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('builtwith-scan', {
      body: { website }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error scanning website technology:', error);
    toast.error('Failed to scan website technology');
    return null;
  }
}

/**
 * Analyze a business website and save the results
 */
export async function analyzeBusinessWebsite(businessId: string, website: string) {
  try {
    toast.info('Analyzing website, this may take a minute...');
    
    // Run performance and technology scans in parallel
    const [performanceResult, technologyResult] = await Promise.all([
      scanWebsitePerformance(website),
      scanWebsiteTechnology(website)
    ]);
    
    if (!performanceResult && !technologyResult) {
      throw new Error('Both website scans failed');
    }
    
    // Calculate the Shit Score™ based on results
    const score = calculateShitScore(performanceResult, technologyResult, website);
    
    // Update the business record with the results
    const { error } = await supabase
      .from('businesses')
      .update({
        score: score,
        cms: technologyResult?.cms || null,
        speed_score: performanceResult?.speedScore || null,
        last_checked: new Date().toISOString()
      })
      .eq('id', businessId);
    
    if (error) throw error;
    
    toast.success('Website analysis complete');
    return true;
  } catch (error) {
    console.error('Error analyzing business website:', error);
    toast.error('Failed to analyze website');
    return false;
  }
}

/**
 * Calculate the Shit Score™ based on analysis results
 */
function calculateShitScore(
  performanceResult: PerformanceResult | null,
  technologyResult: TechnologyResult | null,
  website: string
): number {
  let score = 0;
  
  // 1. Page Speed Issues (0-30 points)
  if (performanceResult) {
    const speedScore = performanceResult.speedScore;
    if (speedScore < 30) {
      score += 30; // Very slow site
    } else if (speedScore < 50) {
      score += 20; // Slow site
    } else if (speedScore < 70) {
      score += 10; // Moderately slow site
    }
  } else {
    score += 15; // Unable to measure speed (partial penalty)
  }
  
  // 2. CMS/Platform (0-20 points)
  if (technologyResult) {
    const cms = technologyResult.cms.toLowerCase();
    if (cms.includes('wix') || cms.includes('squarespace')) {
      score += 20;
    } else if (cms.includes('wordpress') && !cms.includes('6.')) {
      // Assuming WordPress versions < 6.x are considered outdated
      score += 20;
    } else if (cms.includes('joomla') || cms.includes('drupal 7')) {
      score += 20;
    }
  } else {
    score += 10; // Unable to detect CMS (partial penalty)
  }
  
  // 3. SSL Status (0-15 points)
  if (!website.startsWith('https://')) {
    score += 15; // No SSL
  }
  
  // 4. Assume mobile friendliness issues (0-15 points)
  // For now, we're randomly assigning this since we don't have a reliable way to check
  if (Math.random() > 0.5) {
    score += 15;
  }
  
  // 5. Assume typography issues (0-10 points)
  // For now, we're randomly assigning this since we don't have a reliable way to check
  if (Math.random() > 0.7) {
    score += 10;
  }
  
  // Ensure score doesn't exceed 100
  return Math.min(score, 100);
}
