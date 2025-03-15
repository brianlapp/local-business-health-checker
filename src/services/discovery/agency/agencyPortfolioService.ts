
import { toast } from 'sonner';
import { Business } from '@/types/business';

/**
 * Analyze an agency's client list by examining their portfolio
 */
export async function analyzeAgencyPortfolioImpl(website: string): Promise<{
  clients: Business[];
  portfolioLinks: string[];
  requestUrl?: string;
  error?: string;
}> {
  try {
    console.log(`Analyzing portfolio for agency website: ${website}`);

    // Format the website URL properly 
    const websiteUrl = website.startsWith('http') ? website : `https://${website}`;
    
    // Check common portfolio page patterns
    const portfolioUrls = [
      `${websiteUrl}/portfolio`,
      `${websiteUrl}/clients`,
      `${websiteUrl}/work`,
      `${websiteUrl}/case-studies`,
      `${websiteUrl}/projects`,
      `${websiteUrl}/our-work`,
      `${websiteUrl}/our-clients`,
      `${websiteUrl}/success-stories`
    ];
    
    // Track portfolio links and clients found
    const portfolioLinks: string[] = [];
    const clients: Business[] = [];
    
    // For each possible portfolio URL, try to fetch and analyze
    for (const portfolioUrl of portfolioUrls) {
      try {
        console.log(`Checking portfolio URL: ${portfolioUrl}`);
        
        // Fetch the portfolio page
        const response = await fetch(portfolioUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOpportunityFinder/1.0)' }
        });
        
        if (response.ok) {
          // We found a portfolio page
          portfolioLinks.push(portfolioUrl);
          
          // Get the HTML content
          const html = await response.text();
          
          // Extract potential client information
          const extractedClients = extractClientsFromHtml(html, websiteUrl);
          clients.push(...extractedClients);
          
          console.log(`Found ${extractedClients.length} potential clients on ${portfolioUrl}`);
          
          // Also check for deeper portfolio pages that might have more clients
          const deeperLinks = extractPortfolioDeepLinks(html, websiteUrl);
          if (deeperLinks.length > 0) {
            console.log(`Found ${deeperLinks.length} deeper portfolio links to check`);
            
            // Only check up to 5 deeper links to avoid too many requests
            const linksToCheck = deeperLinks.slice(0, 5);
            
            for (const deepLink of linksToCheck) {
              try {
                const deepResponse = await fetch(deepLink, {
                  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOpportunityFinder/1.0)' }
                });
                
                if (deepResponse.ok) {
                  const deepHtml = await deepResponse.text();
                  const deepClients = extractClientsFromHtml(deepHtml, websiteUrl);
                  clients.push(...deepClients);
                  
                  console.log(`Found ${deepClients.length} additional clients on ${deepLink}`);
                  portfolioLinks.push(deepLink);
                }
              } catch (err) {
                console.log(`Error checking deeper link ${deepLink}:`, err);
              }
            }
          }
        }
      } catch (e) {
        console.log(`Error checking ${portfolioUrl}:`, e);
        // Continue to the next URL even if this one fails
      }
    }
    
    // Deduplicate clients by name
    const uniqueClients = clients.filter((client, index, self) => 
      index === self.findIndex(c => c.name === client.name)
    );
    
    console.log(`Found ${uniqueClients.length} unique clients after deduplication`);
    
    // Check if we found any portfolio pages
    if (portfolioLinks.length === 0) {
      return {
        clients: [],
        portfolioLinks: [],
        requestUrl: portfolioUrls[0],
        error: 'No portfolio pages found'
      };
    }
    
    // Return the results
    return {
      clients: uniqueClients,
      portfolioLinks,
      requestUrl: portfolioLinks[0]
    };
  } catch (error: any) {
    console.error('Error analyzing agency portfolio:', error);
    toast.error('Failed to analyze agency portfolio');
    return {
      clients: [],
      portfolioLinks: [],
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Extract client information from HTML
 */
function extractClientsFromHtml(html: string, baseUrl: string): Business[] {
  const clients: Business[] = [];
  
  try {
    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Look for structured case study or portfolio sections
    const caseStudySections = [
      ...Array.from(doc.querySelectorAll('section[class*="case-study"]')),
      ...Array.from(doc.querySelectorAll('section[class*="portfolio"]')),
      ...Array.from(doc.querySelectorAll('section[class*="client"]')),
      ...Array.from(doc.querySelectorAll('div[class*="case-study"]')),
      ...Array.from(doc.querySelectorAll('div[class*="portfolio"]')),
      ...Array.from(doc.querySelectorAll('div[class*="client"]'))
    ];
    
    caseStudySections.forEach(section => {
      try {
        // Look for headings that might contain client names
        const heading = section.querySelector('h1, h2, h3, h4, h5');
        if (heading) {
          const name = heading.textContent?.trim();
          if (name && name.length > 0 && name.length < 100) {
            // Look for links that might be the client website
            const links = Array.from(section.querySelectorAll('a[href*="http"]'));
            let website = '';
            
            // Find a link that's likely to be the client website
            for (const link of links) {
              const href = link.getAttribute('href');
              const text = link.textContent?.trim();
              
              if (href && !href.includes(baseUrl) && 
                  !href.includes('facebook.com') && 
                  !href.includes('twitter.com') && 
                  !href.includes('linkedin.com')) {
                website = href;
                break;
              }
            }
            
            clients.push({
              id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              website,
              status: 'discovered',
              source: 'agency-portfolio-case-study'
            });
          }
        }
      } catch (err) {
        console.log('Error processing case study section:', err);
      }
    });
    
    // 2. Look for client lists or grids
    const clientElements = [
      ...Array.from(doc.querySelectorAll('.client')),
      ...Array.from(doc.querySelectorAll('.portfolio-item')),
      ...Array.from(doc.querySelectorAll('.case-study')),
      ...Array.from(doc.querySelectorAll('.project')),
      ...Array.from(doc.querySelectorAll('.work-item')),
      ...Array.from(doc.querySelectorAll('.clients-list li')),
      ...Array.from(doc.querySelectorAll('.portfolio-list li')),
      ...Array.from(doc.querySelectorAll('section[id*="client"] a')),
      ...Array.from(doc.querySelectorAll('section[id*="portfolio"] a')),
      ...Array.from(doc.querySelectorAll('div[class*="client"] a')),
      ...Array.from(doc.querySelectorAll('div[class*="portfolio"] a'))
    ];
    
    clientElements.forEach(element => {
      try {
        // Try to extract client name
        let name = '';
        const nameElement = element.querySelector('h2, h3, h4, .title, .name, strong');
        if (nameElement) {
          name = nameElement.textContent?.trim() || '';
        } else {
          name = element.textContent?.trim() || '';
        }
        
        // Only proceed if we found a name
        if (name && name.length > 0 && name.length < 100) {
          // Try to extract website
          let website = '';
          const linkElement = element.querySelector('a');
          if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
              // Format URL properly
              if (href.startsWith('http')) {
                website = href;
              } else if (href.startsWith('/')) {
                // Relative URL
                website = new URL(href, baseUrl).toString();
              } else {
                website = `${baseUrl}/${href}`;
              }
            }
          }
          
          // Create the client business object
          if (name) {
            clients.push({
              id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              website,
              status: 'discovered',
              source: 'agency-portfolio'
            });
          }
        }
      } catch (err) {
        console.log('Error processing client element:', err);
      }
    });
    
    // 3. Look for client logos (common way agencies display clients)
    const logoSections = [
      ...Array.from(doc.querySelectorAll('section[class*="client"]')),
      ...Array.from(doc.querySelectorAll('div[class*="client"]')),
      ...Array.from(doc.querySelectorAll('ul[class*="client"]')),
      ...Array.from(doc.querySelectorAll('section[class*="logo"]')),
      ...Array.from(doc.querySelectorAll('div[class*="logo"]')),
      ...Array.from(doc.querySelectorAll('div[class*="partner"]')),
      doc.body // Fallback to check entire body if no specific sections found
    ];
    
    logoSections.forEach(section => {
      const imgElements = section.querySelectorAll('img[alt*="logo"], img[class*="client"], img[class*="logo"], img[src*="client"], img[src*="logo"]');
      imgElements.forEach(img => {
        try {
          const alt = img.getAttribute('alt');
          if (alt && alt.length > 0 && alt.length < 100) {
            // Avoid using "logo" or similar as the name
            if (!alt.toLowerCase().match(/^(logo|client|partner)s?$/)) {
              clients.push({
                id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: alt.trim(),
                status: 'discovered',
                source: 'agency-portfolio-logo'
              });
            }
          }
        } catch (err) {
          console.log('Error processing logo element:', err);
        }
      });
    });
    
    return clients;
  } catch (error) {
    console.error('Error extracting clients from HTML:', error);
    return clients;
  }
}

/**
 * Extract deeper links to portfolio pages
 */
function extractPortfolioDeepLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Keywords that suggest a link leads to a portfolio item
    const portfolioKeywords = [
      'case-study', 'casestudy', 'case study', 'portfolio', 'project', 
      'work', 'client', 'success-story', 'success story'
    ];
    
    // Find all links
    const allLinks = Array.from(doc.querySelectorAll('a[href]'));
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent?.toLowerCase() || '';
      
      if (href) {
        // Determine if this is a portfolio link by checking text content or href
        const isPortfolioLink = portfolioKeywords.some(keyword => 
          text.includes(keyword) || href.includes(keyword)
        );
        
        if (isPortfolioLink) {
          // Format the full URL
          let fullUrl;
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = new URL(href, baseUrl).toString();
          } else {
            fullUrl = `${baseUrl}/${href}`;
          }
          
          // Only add if it's not the same as the base URL and not already in the list
          if (fullUrl !== baseUrl && !links.includes(fullUrl)) {
            links.push(fullUrl);
          }
        }
      }
    });
    
    return links;
  } catch (error) {
    console.error('Error extracting portfolio deep links:', error);
    return links;
  }
}

/**
 * Get portfolio page URLs from an agency website
 */
export async function findPortfolioPages(website: string): Promise<string[]> {
  try {
    const websiteUrl = website.startsWith('http') ? website : `https://${website}`;
    
    // Common paths where portfolio pages might be found
    const potentialPaths = [
      '/portfolio',
      '/clients',
      '/work',
      '/case-studies',
      '/projects',
      '/our-work',
      '/our-clients',
      '/success-stories'
    ];
    
    const foundUrls: string[] = [];
    
    // Check each potential path to see if it exists
    for (const path of potentialPaths) {
      try {
        const url = `${websiteUrl}${path}`;
        const response = await fetch(url, {
          method: 'HEAD',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreelanceOpportunityFinder/1.0)' }
        });
        
        if (response.ok) {
          foundUrls.push(url);
        }
      } catch (e) {
        // Ignore errors and continue checking
      }
    }
    
    return foundUrls;
  } catch (error) {
    console.error('Error finding portfolio pages:', error);
    return [];
  }
}
