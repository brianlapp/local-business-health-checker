import { Business } from '@/types/business';

export function generateIssues(business: any) {
  // Use the highest available speed score to be more generous
  const lighthouseScore = business.lighthouse_score || business.lighthouseScore || 0;
  const gtmetrixScore = business.gtmetrix_score || business.gtmetrixScore || 0;
  const speedScore = Math.max(lighthouseScore, gtmetrixScore);
  
  // Generate the individual issues
  const issues = {
    // Only mark speed issues if both scores are low (when available)
    speedIssues: gtmetrixScore > 0 && lighthouseScore > 0 
      ? (gtmetrixScore < 70 && lighthouseScore < 70)  // Both scores must be low
      : speedScore < 70,  // Fallback to single score check
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: !isMobileFriendly(business),
    badFonts: hasBadFonts(business),
  };
  
  // Instead of just returning the issues object, also update the business score
  // This will ensure the score is properly calculated based on the actual issues
  calculateBusinessScore(business, issues);
  
  return issues;
}

// Function to calculate the business score based on issues
export function calculateBusinessScore(business: any, issues?: any) {
  // If issues aren't provided, generate them
  const currentIssues = issues || generateIssues(business);
  
  console.log('------ START SCORE CALCULATION ------');
  console.log(`Business: ${business.name}, Current score: ${business.score}`);
  console.log('Issues:', JSON.stringify(currentIssues));
  
  // Start with a base score of 0 (0 = perfect site, 100 = terrible site)
  let score = 0;
  
  // Add penalty points for each issue
  if (currentIssues.speedIssues) {
    score += 30;
    console.log('Added +30 for speed issues, score now:', score);
  }
  if (currentIssues.outdatedCMS) {
    score += 20;
    console.log('Added +20 for outdated CMS, score now:', score);
  }
  if (currentIssues.noSSL) {
    score += 15;
    console.log('Added +15 for no SSL, score now:', score);
  }
  if (currentIssues.notMobileFriendly) {
    score += 15;
    console.log('Added +15 for not mobile friendly, score now:', score);
  }
  if (currentIssues.badFonts) {
    score += 10;
    console.log('Added +10 for bad fonts, score now:', score);
  }
  
  // Use Lighthouse/GTmetrix scores to influence the score
  const lighthouseScore = business.lighthouse_score || business.lighthouseScore || 0;
  const gtmetrixScore = business.gtmetrix_score || business.gtmetrixScore || 0;
  
  console.log(`Lighthouse score: ${lighthouseScore}, GTmetrix score: ${gtmetrixScore}`);
  
  // CRITICAL FIX: Lighthouse and GTmetrix score INVERSION logic
  // For performance scores, higher is better (90 = excellent)
  // For Shit Score, lower is better (10 = excellent)
  
  if (lighthouseScore > 0) {
    console.log(`Checking Lighthouse score logic, current score: ${score}`);
    // Excellent Lighthouse score (90+) should lead to a good Shit Score
    if (lighthouseScore >= 90) {
      const issueCount = Object.values(currentIssues).filter(Boolean).length;
      console.log(`Excellent Lighthouse (90+), issue count: ${issueCount}`);
      if (issueCount === 0) {
        score = Math.min(score, 10); // Almost perfect with no issues
        console.log('No issues + excellent Lighthouse, capping score at 10');
      } else if (issueCount === 1) {
        score = Math.min(score, 20); // Very good with 1 minor issue
        console.log('1 issue + excellent Lighthouse, capping score at 20');
      } else if (issueCount === 2) {
        score = Math.min(score, 30); // Good with 2 issues
        console.log('2 issues + excellent Lighthouse, capping score at 30');
      } else {
        score = Math.min(score, 40); // Fair with 3+ issues but great performance
        console.log('3+ issues + excellent Lighthouse, capping score at 40');
      }
    }
    // Good Lighthouse score (80-89) should lead to a decent Shit Score
    else if (lighthouseScore >= 80) {
      const issueCount = Object.values(currentIssues).filter(Boolean).length;
      console.log(`Good Lighthouse (80-89), issue count: ${issueCount}`);
      if (issueCount <= 1) {
        score = Math.min(score, 30); // Good with 0-1 issues
        console.log('0-1 issues + good Lighthouse, capping score at 30');
      } else if (issueCount <= 3) {
        score = Math.min(score, 45); // Fair with 2-3 issues
        console.log('2-3 issues + good Lighthouse, capping score at 45');
      }
    }
    // Poor Lighthouse score (<50) should ensure a poor Shit Score
    else if (lighthouseScore < 50) {
      score = Math.max(score, 70); // Poor minimum
      console.log('Poor Lighthouse (<50), setting minimum score to 70');
    }
    // Very poor Lighthouse score (<30) should guarantee a terrible Shit Score
    else if (lighthouseScore < 30) {
      score = Math.max(score, 85); // Very poor minimum
      console.log('Very poor Lighthouse (<30), setting minimum score to 85');
    }
  }
  
  // If we have both scores and they're drastically different, trust the better one more
  if (lighthouseScore > 0 && gtmetrixScore > 0) {
    const betterScore = Math.max(lighthouseScore, gtmetrixScore);
    const worseScore = Math.min(lighthouseScore, gtmetrixScore);
    
    // If scores are very different (>30 points apart)
    if (Math.abs(lighthouseScore - gtmetrixScore) > 30) {
      if (betterScore >= 85) {
        // With a good score from either test, cap the Shit Score
        const issueCount = Object.values(currentIssues).filter(Boolean).length;
        console.log(`Scores are very different, issue count: ${issueCount}`);
        if (issueCount <= 2) {
          score = Math.min(score, 45); // Cap at 45 with 0-2 issues
          console.log('Cap at 45 with 0-2 issues');
        }
      }
      // If one score is terrible but the other is decent, don't be too harsh
      else if (worseScore < 40 && betterScore > 70) {
        score = Math.min(score, 60); // Cap at 60
        console.log('Cap at 60');
      }
    }
  }
  
  // Cap the score at 100
  score = Math.min(100, score);
  
  console.log(`Final calculated score: ${score}`);
  console.log(`Previous score in database: ${business.score}`);
  console.log('------ END SCORE CALCULATION ------');
  
  // Update the business score if it's different
  if (business.score !== score) {
    business.score = score;
    console.log(`Updated business score to: ${score}`);
  }
  
  return score;
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
