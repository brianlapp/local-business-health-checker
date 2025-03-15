
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
      `${websiteUrl}/projects`
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
        }
      } catch (e) {
        console.log(`Error checking ${portfolioUrl}:`, e);
        // Continue to the next URL even if this one fails
      }
    }
    
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
      clients,
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
    
    // Look for common client/portfolio item patterns
    
    // 1. Find elements that might contain client information
    const clientElements = [
      ...Array.from(doc.querySelectorAll('.client')),
      ...Array.from(doc.querySelectorAll('.portfolio-item')),
      ...Array.from(doc.querySelectorAll('.case-study')),
      ...Array.from(doc.querySelectorAll('.project')),
      ...Array.from(doc.querySelectorAll('.work-item')),
      // Look for list items within client lists
      ...Array.from(doc.querySelectorAll('.clients-list li')),
      ...Array.from(doc.querySelectorAll('.portfolio-list li')),
      // Also look for links within sections that might be about clients/portfolio
      ...Array.from(doc.querySelectorAll('section[id*="client"] a')),
      ...Array.from(doc.querySelectorAll('section[id*="portfolio"] a')),
      ...Array.from(doc.querySelectorAll('div[class*="client"] a')),
      ...Array.from(doc.querySelectorAll('div[class*="portfolio"] a'))
    ];
    
    // Process each potential client element
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
        if (name && name.length > 0 && name.length < 100) { // Avoid text that's too long to be a name
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
    
    // Also look for client logos (common way agencies display clients)
    const imgElements = doc.querySelectorAll('img[alt*="logo"], img[class*="client"], img[class*="logo"]');
    imgElements.forEach(img => {
      try {
        const alt = img.getAttribute('alt');
        if (alt && !alt.includes('logo') && alt.length > 0 && alt.length < 100) {
          clients.push({
            id: `extracted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: alt.trim(),
            status: 'discovered',
            source: 'agency-portfolio-logo'
          });
        }
      } catch (err) {
        console.log('Error processing logo element:', err);
      }
    });
    
    // Remove duplicates based on name
    const uniqueClients = clients.filter((client, index, self) => 
      index === self.findIndex(c => c.name === client.name)
    );
    
    return uniqueClients;
  } catch (error) {
    console.error('Error extracting clients from HTML:', error);
    return clients;
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
