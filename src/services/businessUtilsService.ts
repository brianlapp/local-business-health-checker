
import { Business } from '@/types/business';

export function generateIssues(business: any) {
  // Use lighthouse_score as primary, fallback to speed_score, or default to 0
  const speedScore = business.lighthouse_score || business.speed_score || 0;
  
  return {
    speedIssues: speedScore < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: !isMobileFriendly(business),
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
  // First check if we have explicit is_mobile_friendly data from database
  if (typeof business.is_mobile_friendly === 'boolean') {
    return business.is_mobile_friendly;
  }
  
  // Check for any modern technology indicators
  const mobileFriendlyTechnologies = [
    // Modern frameworks and libraries
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
    // UI frameworks
    'bootstrap', 'tailwind', 'foundation', 'bulma', 'material-ui',
    'chakra', 'semantic ui', 'materialize',
    // Modern CSS features
    'flexbox', 'grid', 'media queries',
    // Modern CMS platforms
    'wordpress', 'wix', 'squarespace', 'shopify', 'webflow',
    'ghost', 'drupal', 'joomla', 'contentful',
    // Web components and modern JS
    'web components', 'custom elements', 'shadow dom',
    // Responsive design indicators
    'mobile', 'responsive', 'adaptive',
    // Modern build tools (often indicate modern practices)
    'webpack', 'vite', 'parcel', 'rollup'
  ];

  // If we have technologies data from BuiltWith scan
  if (business.technologies && Array.isArray(business.technologies)) {
    for (const tech of business.technologies) {
      const techName = (tech.name || '').toLowerCase();
      const techCategory = (tech.category || '').toLowerCase();
      
      // Check both name and category against our list
      if (mobileFriendlyTechnologies.some(t => 
        techName.includes(t.toLowerCase()) || 
        techCategory.includes(t.toLowerCase())
      )) {
        return true;
      }
    }
  }
  
  // If we have CMS info but no explicit technologies
  if (business.cms) {
    const cmsLower = business.cms.toLowerCase();
    if (mobileFriendlyTechnologies.some(t => cmsLower.includes(t))) {
      return true;
    }
  }
  
  // For modern domains created in recent years, assume they're mobile-friendly
  // This is a reasonable assumption as most modern web development practices
  // prioritize mobile responsiveness
  if (business.website) {
    try {
      const url = new URL(business.website.startsWith('http') ? 
        business.website : 
        `https://${business.website}`
      );
      // Check for .ca TLD
      if (url.hostname.endsWith('.ca')) {
        return true;
      }
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  }

  // If we can't determine, default to true for modern web
  // Most websites today are built with mobile in mind
  return true;
}
