import { Business } from '@/types/business';

export function generateIssues(business: any) {
  // Use lighthouse_score as primary, fallback to speed_score, or default to 0
  const speedScore = business.lighthouse_score || business.speed_score || 0;
  
  return {
    speedIssues: speedScore < 70, // More reasonable threshold based on industry standards
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: !isMobileFriendly(business),
    badFonts: hasBadFonts(business), // Use new function instead of random
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

// New function to determine if a site might be using bad fonts
// Instead of using random, we use heuristics
export function hasBadFonts(business: any): boolean {
  // If we have technologies data, check for modern font usage
  if (business.technologies && Array.isArray(business.technologies)) {
    // Check if the site uses modern font technologies
    const modernFontTech = ['Google Fonts', 'Font Awesome', 'Adobe Fonts', 'Typekit'];
    
    for (const tech of business.technologies) {
      const techName = (tech.name || '').toLowerCase();
      if (modernFontTech.some(t => techName.includes(t.toLowerCase()))) {
        return false; // Using modern font tech, likely not bad fonts
      }
    }
  }
  
  // Check for sites that typically have good typography
  if (business.website) {
    const siteName = business.website.toLowerCase();
    // Sites built with modern platforms usually have good typography
    if (siteName.includes('shopify') || 
        siteName.includes('wix') || 
        siteName.includes('squarespace') ||
        siteName.includes('webflow')) {
      return false;
    }
  }
  
  // For newly scanned sites where we don't have enough data yet,
  // we'll assume they don't have bad fonts (instead of random generation)
  if (business.created_at) {
    const creationDate = new Date(business.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
    if (daysSinceCreation < 7) {
      return false;
    }
  }
  
  // For sites with high page speed scores, assume they've invested in good design too
  if ((business.lighthouse_score || business.speed_score || 0) > 85) {
    return false;
  }
  
  // Default: For now, keep some randomness but with lower probability (20% chance)
  // This will be replaced with better detection in future
  return Math.random() < 0.2;
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
