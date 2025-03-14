
import { Business } from '@/types/business';

/**
 * Generate issue flags based on business data
 */
export function generateIssues(business: Partial<Business>) {
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
