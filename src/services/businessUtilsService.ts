
import { Business } from '@/types/business';

/**
 * Generate issue flags based on business data
 */
export function generateIssues(business: Partial<Business>) {
  // Add validation logging
  console.log('Generating issues for business:', business.id);
  console.log('Business score properties:', {
    score: business.score,
    lighthouseScore: business.lighthouseScore,
    lighthouse_score: business.lighthouse_score,
    gtmetrixScore: business.gtmetrixScore,
    gtmetrix_score: business.gtmetrix_score
  });
  
  return {
    speedIssues: business.speedScore ? business.speedScore < 50 : false,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: business.is_mobile_friendly === false,
    badFonts: false // Default value, would require font analysis
  };
}

/**
 * Check if a CMS is outdated
 */
export function isCMSOutdated(cms?: string): boolean {
  if (!cms) return false;
  
  // Simple patterns to detect outdated CMS versions
  const outdatedPatterns = [
    /wordpress\s+[1-4]\./i,
    /wordpress\s+5\.[0-8]/i,
    /joomla\s+[1-2]\./i,
    /joomla\s+3\.[0-9]\./i,
    /drupal\s+[1-7]\./i
  ];
  
  return outdatedPatterns.some(pattern => pattern.test(cms));
}

/**
 * Check if a website is secure (has HTTPS)
 */
export function isWebsiteSecure(website?: string): boolean {
  if (!website) return false;
  return website.startsWith('https://');
}

/**
 * Log type validation information for debugging
 */
export function validateBusinessType(business: Business, context: string): void {
  console.log(`[TypeValidation:${context}] Business:`, {
    id: business.id,
    name: business.name,
    hasSnakeCase: {
      lighthouse_score: business.lighthouse_score !== undefined,
      gtmetrix_score: business.gtmetrix_score !== undefined,
      lighthouse_report_url: business.lighthouse_report_url !== undefined,
      gtmetrix_report_url: business.gtmetrix_report_url !== undefined,
      last_checked: business.last_checked !== undefined
    },
    hasCamelCase: {
      lighthouseScore: business.lighthouseScore !== undefined,
      gtmetrixScore: business.gtmetrixScore !== undefined,
      lighthouseReportUrl: business.lighthouseReportUrl !== undefined,
      gtmetrixReportUrl: business.gtmetrixReportUrl !== undefined,
      lastChecked: business.lastChecked !== undefined
    }
  });
}
