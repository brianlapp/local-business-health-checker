
// File: src/services/businessUtilsService.ts

import { Business } from '@/types/business';

export function generateIssues(business: Business | any): {
  speedIssues?: boolean;
  outdatedCMS?: boolean;
  noSSL?: boolean;
  notMobileFriendly?: boolean;
  badFonts?: boolean;
} {
  // If business already has issues defined, return them
  if (business.issues) {
    return business.issues;
  }

  // Generate issues based on business data
  const issues = {
    speedIssues: false,
    outdatedCMS: false,
    noSSL: false,
    notMobileFriendly: false,
    badFonts: false
  };

  // Speed issues if lighthouse score is below 50
  if (business.lighthouse_score !== undefined && business.lighthouse_score < 50) {
    issues.speedIssues = true;
  } else if (business.lighthouseScore !== undefined && business.lighthouseScore < 50) {
    issues.speedIssues = true;
  }

  // SSL issues if website does not include https
  if (business.website) {
    issues.noSSL = !business.website.includes('https');
  }

  // Mobile friendly based on mobile friendly flag
  if (business.is_mobile_friendly === false) {
    issues.notMobileFriendly = true;
  }

  // CMS issues
  if (business.cms) {
    // Check for outdated CMSes
    const outdatedCMSList = ['wordpress 4', 'wordpress 5.0', 'joomla 3', 'drupal 7'];
    issues.outdatedCMS = outdatedCMSList.some(cms => 
      business.cms.toLowerCase().includes(cms.toLowerCase())
    );
  }

  return issues;
}

export function generateBusinessScore(business: Business | any): number {
  // If business already has a score, return it
  if (business.score) {
    return business.score;
  }

  // Base score
  let score = 50;

  // Add points for good lighthouse score
  if (business.lighthouse_score || business.lighthouseScore) {
    const lighthouseScore = business.lighthouse_score || business.lighthouseScore;
    if (lighthouseScore > 90) score += 20;
    else if (lighthouseScore > 70) score += 15;
    else if (lighthouseScore > 50) score += 10;
    else if (lighthouseScore < 30) score -= 10;
  }

  // Add points for mobile-friendly
  if (business.is_mobile_friendly === true) {
    score += 10;
  } else if (business.is_mobile_friendly === false) {
    score -= 10;
  }

  // Add points for SSL
  if (business.website) {
    if (business.website.includes('https')) {
      score += 5;
    } else {
      score -= 5;
    }
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

export function businessNeedsUpdate(business: Business): boolean {
  // Check if the business has been checked in the last 7 days
  const lastChecked = business.last_checked || business.lastChecked;
  
  if (!lastChecked) {
    return true; // Never checked, so needs update
  }
  
  const lastCheckDate = new Date(lastChecked);
  const now = new Date();
  const daysSinceLastCheck = (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceLastCheck > 7;
}

// Check if a CMS is outdated
export function isCMSOutdated(cms: string | undefined): boolean {
  if (!cms) return false;
  
  const outdatedCMSList = ['wordpress 4', 'wordpress 5.0', 'joomla 3', 'drupal 7'];
  return outdatedCMSList.some(outdatedCms => 
    cms.toLowerCase().includes(outdatedCms.toLowerCase())
  );
}

// Check if a website is secure (has HTTPS)
export function isWebsiteSecure(website: string | undefined): boolean {
  if (!website) return false;
  return website.includes('https');
}
