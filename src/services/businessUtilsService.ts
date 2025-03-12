import { Business } from '@/types/business';

export function generateIssues(business: any) {
  // Use lighthouse_score as primary, fallback to speed_score, or default to 0
  const speedScore = business.lighthouse_score || business.speed_score || 0;
  
  return {
    speedIssues: speedScore < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: !isMobileFriendly(business), // Use the new function
    badFonts: Math.random() > 0.7, // Example placeholder
  };
}

export function isCMSOutdated(cms: string | null | undefined): boolean {
  if (!cms) return false;
  
  const outdatedCMSList = [
    'WordPress 5.4', 'WordPress 5.5', 'WordPress 5.6',
    'Joomla 3.8', 'Joomla 3.9',
    'Drupal 7', 'Drupal 8'
  ];
  
  return outdatedCMSList.some(outdatedCMS => cms.includes(outdatedCMS));
}

export function isWebsiteSecure(website: string): boolean {
  return website.startsWith('https://') || !website.startsWith('http://');
}

export function isMobileFriendly(business: any): boolean {
  // If we have explicit mobile-friendly data from the scan, use it
  if (typeof business.is_mobile_friendly === 'boolean') {
    return business.is_mobile_friendly;
  }
  
  // Otherwise make an educated guess based on CMS and other factors
  const mobileFriendlyCMS = [
    'WordPress', 'Wix', 'Squarespace', 'Shopify', 
    'Webflow', 'Ghost', 'Bubble', 'React', 'Vue', 'Angular'
  ];
  
  // If it's a modern CMS, it's likely mobile-friendly
  if (business.cms && mobileFriendlyCMS.some(cms => business.cms.includes(cms))) {
    return true;
  }
  
  // Default to not mobile-friendly if we can't determine
  return false;
}
