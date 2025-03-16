
import { Business } from '@/types/business';

/**
 * Generate issues object for a business based on various factors
 */
export function generateIssues(business: any): Business['issues'] {
  if (!business) return undefined;
  
  // Extract relevant data
  const hasLighthouseScore = business.lighthouse_score !== undefined || business.lighthouseScore !== undefined;
  const score = business.lighthouse_score || business.lighthouseScore || 0;
  
  return {
    speedIssues: score < 70 || business.speed_score < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: business.is_mobile_friendly === false,
    badFonts: false // Default value as we don't currently check fonts
  };
}

/**
 * Check if a CMS version is outdated
 */
export function isCMSOutdated(cms?: string): boolean {
  if (!cms) return false;
  
  const lowerCms = cms.toLowerCase();
  return lowerCms.includes('wordpress 5.') || 
         lowerCms.includes('joomla 3') || 
         lowerCms.includes('drupal 7');
}

/**
 * Check if a website uses HTTPS
 */
export function isWebsiteSecure(website?: string): boolean {
  if (!website) return true; // Can't determine if secure
  return !website.startsWith('http:');
}

/**
 * Helper function to ensure business objects always have a status
 * This acts as a transformation layer between the database and our application
 */
export function ensureBusinessStatus(business: any): Business {
  // If it's not an object or is null, return a default business
  if (!business || typeof business !== 'object') {
    console.warn('Invalid business object provided to ensureBusinessStatus', business);
    return {
      id: '',
      name: 'Unknown',
      status: 'discovered',
    };
  }
  
  // Make sure the business has a status field
  return {
    ...business,
    status: business.status || 'discovered',
    // Map database column names to camelCase for consistency
    lastChecked: business.last_checked,
    speedScore: business.speed_score,
    lighthouseScore: business.lighthouse_score,
    gtmetrixScore: business.gtmetrix_score,
    lighthouseReportUrl: business.lighthouse_report_url,
    gtmetrixReportUrl: business.gtmetrix_report_url,
    lastLighthouseScan: business.last_lighthouse_scan,
    lastGtmetrixScan: business.last_gtmetrix_scan,
    // Generate issues if not already present
    issues: business.issues || generateIssues(business),
  };
}

/**
 * Batch process multiple business objects to ensure they all have a status
 */
export function ensureBusinessesStatus(businesses: any[]): Business[] {
  if (!Array.isArray(businesses)) {
    console.warn('Invalid businesses array provided to ensureBusinessesStatus', businesses);
    return [];
  }
  
  return businesses.map(business => ensureBusinessStatus(business));
}
