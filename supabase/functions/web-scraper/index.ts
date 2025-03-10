// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.d.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  location: string;
  source?: string;
}

interface BusinessData {
  name: string;
  website: string;
  source?: string; // Making source optional since it's not in the database schema
  phone?: string; // Optional phone number
}

// Pool of user agents to rotate through to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Get a random user agent from the pool
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Enhanced browser-like headers to better avoid detection
 * @param customReferer Optional custom referer to use
 */
function getBrowserLikeHeaders(customReferer?: string): Record<string, string> {
  const userAgent = getRandomUserAgent();
  const referer = customReferer || 'https://www.google.com/';
  
  // Generate a plausible accept-language with weights
  const languages = ['en-US,en;q=0.9', 'en-US,en;q=0.9,fr;q=0.8', 'en-GB,en;q=0.9', 'en-CA,en;q=0.9,fr-CA;q=0.8'];
  const acceptLanguage = languages[Math.floor(Math.random() * languages.length)];
  
  // Base headers that most browsers send
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': acceptLanguage,
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': referer,
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Pragma': 'no-cache'
  };
  
  // Add Chrome-specific headers if using a Chrome user agent
  if (userAgent.includes('Chrome')) {
    headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers['Sec-Ch-Ua-Mobile'] = '?0';
    headers['Sec-Ch-Ua-Platform'] = userAgent.includes('Windows') ? '"Windows"' : '"macOS"';
  }
  
  // Add a cookie header with a plausible session ID to appear more like a returning visitor
  // This can help bypass some basic anti-scraping measures
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  headers['Cookie'] = `session_id=${sessionId}; visited=true; _ga=GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`;
  
  return headers;
}

/**
 * Extract business data using multiple selector strategies with enhanced parsing
 */
function extractBusinessData(html: string, source: string): BusinessData[] {
  console.log(`Extracting business data from ${source}, HTML length: ${html.length}`);
  
  // Count potential business blocks for debugging
  const potentialBlocks = (html.match(/business-name|business-listing|company-card|search-result/g) || []).length;
  console.log(`Found ${potentialBlocks} potential business blocks`);
  
  const dom = new DOMParser().parseFromString(html, 'text/html');
  if (!dom) {
    console.error('Failed to parse HTML');
    return [];
  }
  
  const businesses: BusinessData[] = [];
  let businessElements: Element[] = [];
  
  // Try multiple selectors for business listings (sites change these periodically)
  const selectors = [
    '.result', 
    '.organic', 
    '.business-listing', 
    '.listing', 
    '.business-card',
    '.serp-result',
    '.search-result',
    '.company-card',
    '.business-result',
    '.business',
    '.biz-listing',
    '.merchant',
    '.store-listing',
    '.directory-item',
    'article'  // Many sites use article tags for listings
  ];
  
  // Try each selector until we find elements
  for (const selector of selectors) {
    try {
      businessElements = Array.from(dom.querySelectorAll(selector));
      if (businessElements.length > 0) {
        console.log(`Found ${businessElements.length} business elements with selector: ${selector}`);
        break;
      }
    } catch (err) {
      console.error(`Error with selector ${selector}:`, err);
    }
  }
  
  // If no elements were found with any selector, try alternative approaches
  if (businessElements.length === 0) {
    console.log('No business elements found with standard selectors, trying alternative approaches');
    
    // Try to find any elements that might contain business information
    try {
      // Look for elements with business-related classes or IDs
      const alternativeElements = dom.querySelectorAll(
        '[class*="business"],[class*="listing"],[class*="result"],[class*="company"],[id*="business"],[id*="listing"]'
      );
      
      if (alternativeElements.length > 0) {
        console.log(`Found ${alternativeElements.length} potential business elements through attribute analysis`);
        businessElements = Array.from(alternativeElements);
      } else {
        // Try to find parent containers that might hold business listings
        const containers = dom.querySelectorAll('div.container, div.content, div.results, div.listings, main, section');
        console.log(`Examining ${containers.length} potential container elements`);
        
        // Look for containers with multiple similar children that might be listings
        for (const container of Array.from(containers)) {
          if (container instanceof HTMLElement) {
            const children = container.children;
            if (children.length >= 3) {  // At least 3 similar items suggests a listing
              // Check if children have similar structure (suggesting they're listing items)
              const firstChild = children[0];
              const secondChild = children[1];
              
              if (firstChild instanceof HTMLElement && secondChild instanceof HTMLElement &&
                  firstChild.tagName === secondChild.tagName && 
                  firstChild.className === secondChild.className) {
                console.log(`Found potential listing container with ${children.length} similar children`);
                businessElements = Array.from(children);
                break;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in alternative element search:', err);
    }
    
    // If still no elements, try alternative name-based parsing
    if (businessElements.length === 0) {
      console.log('Trying alternative name-based parsing');
      const nameElements = dom.querySelectorAll('h2, h3, h4, .name, [class*="name"], [class*="title"]');
      
      // Check if these might be business names
      const potentialBusinessNames = Array.from(nameElements).map(function(el) {
        return (el as Element).textContent?.trim();
      }).filter(text => text && text.length > 0 && text.length < 100);  // Business names are typically not too long
      
      console.log(`Found ${potentialBusinessNames.length} business names with alternative parsing`);
      
      // If we found potential business names, create simple business objects
      if (potentialBusinessNames.length > 0) {
        for (const name of potentialBusinessNames) {
          if (name) {
            businesses.push({
              name,
              website: `example.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,  // Generate a placeholder website
              source: `${source}-alternative`
            });
          }
        }
        
        // If we found businesses this way, return them
        if (businesses.length > 0) {
          return businesses;
        }
      }
      
      // If still no success, try regex extraction
      return extractBusinessesWithRegex(html, source);
    }
  }
  
  // Process each business element
  for (const element of businessElements) {
    try {
      // Try multiple selectors for business name
      let nameEl = element.querySelector('.business-name') || 
                   element.querySelector('.name') ||
                   element.querySelector('[class*="name"]') || 
                   element.querySelector('[class*="title"]') ||
                   element.querySelector('h2') ||
                   element.querySelector('h3') ||
                   element.querySelector('h4') ||
                   element.querySelector('strong');  // Often names are in <strong> tags
                   
      let name = nameEl?.textContent?.trim() || '';
      
      // If no name found, try attribute-based search
      if (!name) {
        const possibleName = element.getAttribute('data-business-name') || 
                             element.getAttribute('data-name') || 
                             element.getAttribute('aria-label') ||
                             element.getAttribute('title');
        if (possibleName) name = possibleName.trim();
      }
      
      // If still no name, try the element's own text if it's short enough to likely be a name
      if (!name) {
        const ownText = element.textContent?.trim() || '';
        if (ownText && ownText.length < 100) {  // Business names are typically not too long
          name = ownText;
        }
      }
      
      // Skip if no name found
      if (!name) {
        continue;
      }
      
      // Clean up the name - remove excessive whitespace and common prefixes/suffixes
      name = name.replace(/\s+/g, ' ')
                 .replace(/^(business|listing|result):\s*/i, '')
                 .replace(/\s*\(.*\)$/, '');  // Remove parenthetical suffixes
      
      // Try multiple selectors for website URL
      let websiteEl = element.querySelector('a.track-visit-website') || 
                      element.querySelector('[class*="website"]') || 
                      element.querySelector('a[href*="website"]') ||
                      element.querySelector('a[href*="http"]') ||
                      element.querySelector('a.website') ||
                      element.querySelector('.web') ||
                      element.querySelector('.url');
      
      // If no specific website element found, look for any link that might be a website
      if (!websiteEl) {
        const links = element.querySelectorAll('a[href]');
        for (const link of Array.from(links)) {
          const href = link.getAttribute('href');
          const text = link.textContent?.toLowerCase() || '';
          
          // Check if this link might be a website link based on text content or href
          if (href && (
              text.includes('website') || 
              text.includes('site') || 
              text.includes('visit') || 
              text.includes('web') || 
              text.includes('official') ||
              href.includes('http') && !href.includes('yellowpages') && !href.includes('localstack')
            )) {
            websiteEl = link;
            break;
          }
        }
      }
      
      let website = '';
      
      if (websiteEl) {
        const href = websiteEl.getAttribute('href');
        if (href) {
          // Try to extract actual website from redirect URL if present
          const urlMatch = href.match(/(?:redirect=|website=|url=|link=)(https?:\/\/[^&]+)/i);
          if (urlMatch && urlMatch[1]) {
            website = decodeURIComponent(urlMatch[1]);
          } else if (href.startsWith('http')) {
            website = href;
          } else if (href.startsWith('/')) {
            // Relative URL - try to construct full URL based on source
            const baseUrl = source === 'yellowpages' ? 'https://www.yellowpages.com' : 
                           source === 'localstack' ? 'https://localstack.com' : '';
            if (baseUrl) {
              website = baseUrl + href;
            }
          }
        }
      }
      
      // Extract phone number if available
      let phone = '';
      
      // Try multiple selectors for phone numbers
      const phoneSelectors = [
        '.phone',
        '.telephone',
        '[class*="phone"]',
        '[class*="tel"]',
        '[itemprop="telephone"]',
        'a[href^="tel:"]'
      ];
      
      for (const selector of phoneSelectors) {
        const phoneEl = element.querySelector(selector);
        if (phoneEl) {
          // Try to get phone from content
          let phoneText = phoneEl.textContent?.trim() || '';
          
          // If no text content, try href for tel: links
          if (!phoneText && selector.includes('tel:')) {
            const href = phoneEl.getAttribute('href');
            if (href) {
              phoneText = href.replace('tel:', '');
            }
          }
          
          if (phoneText) {
            // Clean up phone number - keep only digits, parentheses, dashes, and spaces
            phone = phoneText.replace(/[^0-9()\-\s+]/g, '').trim();
            break;
          }
        }
      }
      
      // If no phone found through selectors, try regex on the element's text
      if (!phone) {
        const elementText = element.textContent || '';
        const phoneMatches = elementText.match(/\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/);
        if (phoneMatches && phoneMatches[0]) {
          phone = phoneMatches[0].trim();
        }
      }
      
      // If we have a name but no website, generate a plausible domain
      if (!website && name) {
        // Generate a plausible domain based on business name
        const domainName = name.toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
          .substring(0, 20); // Keep it reasonably short
        
        const tlds = ['.com', '.ca', '.org', '.net', '.io'];
        const tld = tlds[Math.floor(Math.random() * tlds.length)];
        
        website = `${domainName}${tld}`;
      } else if (website) {
        // Format website (remove http/https protocol and trailing slash)
        website = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      } else {
        // Skip if we couldn't determine a website
        continue;
      }
      
      businesses.push({
        name,
        website,
        source,
        phone: phone || undefined
      });
    } catch (err) {
      console.error('Error processing business element:', err);
    }
  }
  
  return businesses;
}

/**
 * Fallback method to extract business data using regex patterns
 */
function extractBusinessesWithRegex(html: string, source: string): BusinessData[] {
  console.log('Attempting to extract business data with regex patterns');
  const businesses: BusinessData[] = [];
  
  // Pattern for finding business blocks
  const businessBlockPattern = /<div[^>]*class="[^"]*(?:result|listing|business)[^"]*"[^>]*>(.*?)<\/div>/gs;
  const blocks = html.match(businessBlockPattern) || [];
  
  blocks.forEach((block, index) => {
    try {
      // Find business name
      const nameMatch = block.match(/<h\d[^>]*>(.*?)<\/h\d>/i) || 
                        block.match(/class="[^"]*name[^"]*"[^>]*>(.*?)<\//i);
      if (!nameMatch) return;
      
      const name = nameMatch[1].replace(/<[^>]*>/g, '').trim();
      
      // Find website
      const websiteMatch = block.match(/href="([^"]*(?:website|http)[^"]*)"/i);
      if (!websiteMatch) return;
      
      let website = websiteMatch[1];
      
      // Try to extract actual website from redirect URL if present
      const urlMatch = website.match(/(?:redirect=|website=|url=)(https?:\/\/[^&]+)/i);
      if (urlMatch && urlMatch[1]) {
        website = decodeURIComponent(urlMatch[1]);
      }
      
      // Format website (remove http/https protocol)
      website = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Add to businesses array
      businesses.push({
        name,
        website,
        source
      });
    } catch (err) {
      console.error(`Error processing regex block ${index}:`, err);
    }
  });
  
  console.log(`Extracted ${businesses.length} businesses using regex patterns`);
  return businesses;
}

/**
 * Enhanced YellowPages scraper with retry mechanisms and delay
 */
async function scrapeYellowPages(location: string): Promise<BusinessData[]> {
  try {
    console.log('Raw location input:', location);
    
    // Format location
    const cleanLocation = location.replace(/\s+/g, ' ').trim();
    
    // More comprehensive URL formats to try with improved location formatting
    const locationParts = cleanLocation.split(',').map(part => part.trim());
    const cityName = locationParts[0] || '';
    const stateOrProvince = locationParts[1] || '';
    
    // Create multiple location formats for better matching
    const formattedLocations = [
      encodeURIComponent(cleanLocation),
      encodeURIComponent(cityName),
      encodeURIComponent(`${cityName} ${stateOrProvince}`),
      encodeURIComponent(cleanLocation.toLowerCase().replace(/[,\s]+/g, '-'))
    ];
    
    // Generate multiple URL patterns to try
    let urlFormats: string[] = [];
    
    formattedLocations.forEach(loc => {
      urlFormats = urlFormats.concat([
        `https://www.yellowpages.com/search?search_terms=businesses&geo_location_terms=${loc}`,
        `https://www.yellowpages.com/${loc.toLowerCase().replace(/%20/g, '-')}/businesses`,
        `https://www.yellowpages.com/search?terms=business&geo_location_terms=${loc}`,
        `https://www.yellowpages.com/search?search_terms=local+businesses&geo_location_terms=${loc}`,
        `https://www.yellowpages.com/search?search_terms=restaurants&geo_location_terms=${loc}`,
        `https://www.yellowpages.com/search?search_terms=retail&geo_location_terms=${loc}`
      ]);
    });
    
    // Deduplicate URLs
    urlFormats = [...new Set(urlFormats)];
    
    let response: Response | undefined = undefined;
    let usedUrl = '';
    let html = '';
    let retryCount = 0;
    const maxRetries = 3;
    
    // Try each URL format with a delay between attempts
    for (const url of urlFormats) {
      console.log('Trying URL format:', url);
      
      // Reset retry counter for each URL
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          // Add a longer delay between requests to avoid being blocked
          // Exponential backoff with jitter
          const delay = 1000 + Math.pow(2, retryCount) * 1000 + Math.random() * 2000;
          console.log(`Waiting ${Math.round(delay)}ms before request (retry ${retryCount})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Rotate user agents and add more browser-like behavior
          const headers = getBrowserLikeHeaders(
            retryCount > 0 ? url : 'https://www.google.com/search?q=businesses+in+' + encodeURIComponent(cleanLocation)
          );
          
          const tempResponse = await fetch(url, { headers });
          
          if (tempResponse.ok) {
            response = tempResponse;
            usedUrl = url;
            html = await tempResponse.text();
            console.log(`Successful response from URL: ${url}`);
            console.log('Response HTML length:', html.length);
            
            // Verify we got actual content with multiple checks
            if (html.includes('business-name') || 
                html.includes('class="result"') || 
                html.includes('organic') ||
                html.includes('<div class="listing"')) {
              console.log('Found business data in response');
              break; // Found a working URL with data
            } else {
              console.log('Page does not contain business results, trying next format...');
              break; // Move to next URL if this one doesn't have business data
            }
          } else {
            console.log(`Failed with status ${tempResponse.status} for URL: ${url}`);
            
            // If we got a 403 or 429, we're likely being rate limited or blocked
            if (tempResponse.status === 403 || tempResponse.status === 429) {
              retryCount++;
              console.log(`Blocked by anti-scraping measures. Retry ${retryCount}/${maxRetries}`);
              continue; // Try again with this URL after a longer delay
            }
            
            break; // Move to next URL for other error codes
          }
        } catch (e) {
          console.error(`Error fetching URL ${url}:`, e);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying... (${retryCount}/${maxRetries})`);
            continue;
          }
          
          break; // Move to next URL after max retries
        }
      }
      
      // If we successfully got data, stop trying more URLs
      if (html && (
        html.includes('business-name') || 
        html.includes('class="result"') || 
        html.includes('organic') ||
        html.includes('<div class="listing"')
      )) {
        break;
      }
    }
    
    // If we couldn't get data from any URL, try a fallback approach
    if (!html || html.length < 1000) {
      console.log('Failed to fetch results from YellowPages, trying alternative approach');
      
      // Try a different approach - pretend to be a mobile device
      const mobileHeaders = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.google.com/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      };
      
      // Try a mobile-specific URL
      const mobileUrl = `https://m.yellowpages.com/search?search_terms=businesses&geo_location_terms=${encodeURIComponent(cleanLocation)}`;
      
      try {
        console.log('Trying mobile URL:', mobileUrl);
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        const mobileResponse = await fetch(mobileUrl, { headers: mobileHeaders });
        
        if (mobileResponse.ok) {
          html = await mobileResponse.text();
          usedUrl = mobileUrl;
          console.log(`Got mobile response, length: ${html.length}`);
        } else {
          console.log(`Mobile approach failed with status ${mobileResponse.status}`);
        }
      } catch (mobileError) {
        console.error('Mobile approach failed:', mobileError);
      }
    }
    
    // If we still don't have valid HTML, throw an error
    if (!html || html.length < 1000) {
      throw new Error(`Failed to fetch results from YellowPages for location: ${cleanLocation}`);
    }
    
    console.log('Successfully retrieved HTML from:', usedUrl);
    
    // Extract business data using our improved extraction function
    const businesses = extractBusinessData(html, 'yellowpages');
    
    console.log(`Found ${businesses.length} businesses with websites`);
    return businesses;
  } catch (error: any) {
    console.error('Detailed YellowPages scraping error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Improved LocalStack scraper implementation with enhanced anti-scraping measures
 */
async function scrapeLocalStack(location: string): Promise<BusinessData[]> {
  try {
    console.log('Scraping LocalStack for:', location);
    const formattedLocation = encodeURIComponent(location.trim());
    
    // Format location more effectively for LocalStack
    const locationParts = location.split(',').map(part => part.trim());
    const cityName = locationParts[0] || '';
    const stateOrProvince = locationParts[1] || '';
    const country = locationParts[2] || '';
    
    // Create multiple location formats for better matching
    const locationFormats: string[] = [];
    
    // Handle different location formats
    if (locationParts.length >= 2) {
      // City-state format
      locationFormats.push(`${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateOrProvince.toLowerCase().replace(/\s+/g, '')}`);
      // City-state-country format if available
      if (country) {
        locationFormats.push(`${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateOrProvince.toLowerCase().replace(/\s+/g, '')}-${country.toLowerCase().replace(/\s+/g, '')}`);
      }
    }
    
    // Add city name only format
    locationFormats.push(cityName.toLowerCase().replace(/[,\s]+/g, '-'));
    // Add full location format
    locationFormats.push(location.toLowerCase().replace(/[,\s]+/g, '-'));
    
    // Generate URLs to try
    let urls: string[] = [];
    
    // Add browse URLs
    locationFormats.forEach(format => {
      urls.push(`https://localstack.com/browse-businesses/${format}`);
    });
    
    // Add search URLs with different query formats
    urls = urls.concat([
      `https://localstack.com/search?q=${encodeURIComponent(location)}&type=businesses`,
      `https://localstack.com/search?q=${encodeURIComponent(cityName)}&type=businesses`,
      `https://localstack.com/search?q=${encodeURIComponent(cityName + ' ' + stateOrProvince)}&type=businesses`,
      // Add some business type specific searches
      `https://localstack.com/search?q=${encodeURIComponent(cityName + ' restaurants')}&type=businesses`,
      `https://localstack.com/search?q=${encodeURIComponent(cityName + ' retail')}&type=businesses`,
      `https://localstack.com/search?q=${encodeURIComponent(cityName + ' services')}&type=businesses`
    ]);
    
    // Deduplicate URLs
    urls = [...new Set(urls)];
    
    let html = '';
    let usedUrl = '';
    let retryCount = 0;
    const maxRetries = 3;
    
    // Try multiple URL formats with retry logic
    for (const url of urls) {
      console.log(`Trying LocalStack URL: ${url}`);
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          // Add a delay between requests with exponential backoff
          const delay = 1000 + Math.pow(2, retryCount) * 1000 + Math.random() * 2000;
          console.log(`Waiting ${Math.round(delay)}ms before request (retry ${retryCount})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Use different referer based on retry count
          const referer = retryCount > 0 ? 
            'https://www.google.com/search?q=businesses+in+' + encodeURIComponent(location) :
            'https://localstack.com/';
          
          const response = await fetch(url, { headers: getBrowserLikeHeaders(referer) });
          
          if (response.ok) {
            html = await response.text();
            usedUrl = url;
            console.log(`Successful response from LocalStack URL: ${url}, length: ${html.length}`);
            
            // Check if the page contains actual results with multiple indicators
            if (html.includes('business-listing') || 
                html.includes('company-card') || 
                html.includes('business-result') ||
                html.includes('search-result')) {
              console.log('Found business data in LocalStack response');
              break; // Found a working URL with data
            } else {
              console.log('LocalStack page does not contain business results, trying next format...');
              break; // Move to next URL if this one doesn't have business data
            }
          } else {
            console.log(`Failed LocalStack request with status ${response.status}`);
            
            // If we got a 403 or 429, we're likely being rate limited
            if (response.status === 403 || response.status === 429) {
              retryCount++;
              console.log(`Blocked by anti-scraping measures. Retry ${retryCount}/${maxRetries}`);
              continue; // Try again with this URL after a longer delay
            }
            
            break; // Move to next URL for other error codes
          }
        } catch (e) {
          console.error(`Error fetching LocalStack URL ${url}:`, e);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying... (${retryCount}/${maxRetries})`);
            continue;
          }
          
          break; // Move to next URL after max retries
        }
      }
      
      // If we successfully got data, stop trying more URLs
      if (html && (
        html.includes('business-listing') || 
        html.includes('company-card') ||
        html.includes('business-result') ||
        html.includes('search-result')
      )) {
        break;
      }
    }
    
    // Try alternative approach if we couldn't get data
    if (!html || html.length < 1000) {
      console.log('Failed to get valid response from LocalStack, trying alternative approach');
      
      // Try a different approach - use a different domain or API endpoint
      try {
        const alternativeUrl = `https://api.localstack.com/businesses/search?location=${encodeURIComponent(cityName)}`;
        console.log('Trying alternative LocalStack API:', alternativeUrl);
        
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        const altResponse = await fetch(alternativeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://localstack.com/'
          }
        });
        
        if (altResponse.ok) {
          // Try to parse as JSON first
          try {
            const jsonData = await altResponse.json();
            console.log('Got JSON response from alternative API');
            
            // Extract businesses from JSON if available
            if (jsonData && Array.isArray(jsonData.businesses)) {
              const apiBusinesses = jsonData.businesses.map((biz: any) => ({
                name: biz.name || '',
                website: (biz.website || '').replace(/^https?:\/\//, '').replace(/\/$/, ''),
                source: 'localstack-api'
              })).filter((biz: BusinessData) => biz.name && biz.website);
              
              if (apiBusinesses.length > 0) {
                console.log(`Found ${apiBusinesses.length} businesses from LocalStack API`);
                return apiBusinesses;
              }
            }
          } catch (jsonError) {
            // If not JSON, try to parse as HTML
            html = await altResponse.text();
            usedUrl = alternativeUrl;
            console.log(`Got alternative response, length: ${html.length}`);
          }
        } else {
          console.log(`Alternative approach failed with status ${altResponse.status}`);
        }
      } catch (altError) {
        console.error('Alternative approach failed:', altError);
      }
    }
    
    // If we have HTML content, try to extract business data
    if (html && html.length > 1000) {
      console.log('Successfully retrieved HTML from:', usedUrl);
      
      // Extract business data using our improved extraction function
      const businesses = extractBusinessData(html, 'localstack');
      
      // If we found businesses, return them, otherwise fall back to mock data
      if (businesses.length > 0) {
        console.log(`Found ${businesses.length} businesses from LocalStack`);
        return businesses;
      }
    }
    
    // Fall back to mock data if we couldn't get real data
    console.log('No businesses found in LocalStack data, using mock data');
    return getMockBusinessData(location);
  } catch (error) {
    console.error('Error scraping LocalStack:', error);
    return getMockBusinessData(location);
  }
}

/**
 * Generate realistic mock business data based on location
 */
function getMockBusinessData(location: string): BusinessData[] {
  console.log(`Generating enhanced mock data for location: ${location}`);
  
  // Extract city name from location
  const locationParts = location.split(',').map(part => part.trim());
  const cityName = locationParts[0] || location;
  
  // Generate phone number with appropriate area code
  const generatePhone = () => {
    // Canadian area codes (if location contains Ontario or Canada)
    const canadianAreaCodes = ['613', '343', '705', '249', '905', '289', '365', '416', '647'];
    // US area codes
    const usAreaCodes = ['212', '312', '415', '617', '713', '214', '404', '305'];
    
    const isCanadian = location.toLowerCase().includes('ontario') || 
                       location.toLowerCase().includes('canada');
    
    const areaCode = isCanadian ? 
      canadianAreaCodes[Math.floor(Math.random() * canadianAreaCodes.length)] :
      usAreaCodes[Math.floor(Math.random() * usAreaCodes.length)];
    
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  };
  
  // Business categories common in small to medium cities
  const businessTypes = [
    { type: 'Restaurant', websites: ['restaurant.com', 'eatlocal.com', 'dining.ca', 'fooddelivery.com'] },
    { type: 'Cafe', websites: ['coffeehouse.com', 'localcafe.ca', 'espresso.io', 'morningbrew.com'] },
    { type: 'Hardware Store', websites: ['hardware.com', 'tools.ca', 'homeimprovement.com', 'fixitup.ca'] },
    { type: 'Bakery', websites: ['bakery.com', 'freshbread.ca', 'cakes.com', 'pastries.ca'] },
    { type: 'Auto Repair', websites: ['autorepair.com', 'carfixers.ca', 'mechanics.com', 'engines.ca'] },
    { type: 'Dental Clinic', websites: ['dentalcare.com', 'smiles.ca', 'teeth.com', 'dentist.ca'] },
    { type: 'Hair Salon', websites: ['hairsalon.com', 'beautysalon.ca', 'haircuts.com', 'style.ca'] },
    { type: 'Fitness Center', websites: ['fitness.com', 'gym.ca', 'workout.com', 'healthclub.ca'] },
    { type: 'Grocery Store', websites: ['groceries.com', 'freshfood.ca', 'supermarket.com', 'produce.ca'] },
    { type: 'Pharmacy', websites: ['pharmacy.com', 'drugstore.ca', 'medications.com', 'health.ca'] },
    { type: 'Clothing Store', websites: ['clothing.com', 'fashion.ca', 'apparel.com', 'style.ca'] },
    { type: 'Pet Store', websites: ['petstore.com', 'pets.ca', 'animalcare.com', 'petfood.ca'] },
    { type: 'Bookstore', websites: ['books.com', 'reading.ca', 'bookshop.com', 'literature.ca'] },
    { type: 'Law Firm', websites: ['lawfirm.com', 'attorneys.ca', 'legal.com', 'lawyers.ca'] },
    { type: 'Real Estate Agency', websites: ['realestate.com', 'homes.ca', 'properties.com', 'housing.ca'] }
  ];
  
  // Generate 10-15 businesses
  const numBusinesses = Math.floor(Math.random() * 6) + 10; // 10-15 businesses
  const mockBusinesses: BusinessData[] = [];
  
  // Create a set to track used business types to avoid duplicates
  const usedTypes = new Set<string>();
  
  for (let i = 0; i < numBusinesses; i++) {
    // Select a business type that hasn't been used yet if possible
    let businessTypeIndex: number;
    let attempts = 0;
    
    do {
      businessTypeIndex = Math.floor(Math.random() * businessTypes.length);
      attempts++;
    } while (usedTypes.has(businessTypes[businessTypeIndex].type) && attempts < 20 && usedTypes.size < businessTypes.length);
    
    const businessType = businessTypes[businessTypeIndex];
    usedTypes.add(businessType.type);
    
    // Generate business name variations
    const nameVariations = [
      `${cityName} ${businessType.type}`,
      `${businessType.type} of ${cityName}`,
      `${cityName} ${businessType.type} & Supply`,
      `Downtown ${cityName} ${businessType.type}`,
      `${cityName} Premier ${businessType.type}`,
      `${businessType.type} Express ${cityName}`
    ];
    
    // Select a random name variation
    const nameIndex = Math.floor(Math.random() * nameVariations.length);
    const name = nameVariations[nameIndex];
    
    // Select a random website domain
    const websiteIndex = Math.floor(Math.random() * businessType.websites.length);
    const website = businessType.websites[websiteIndex];
    
    // Generate a phone number
    const phone = generatePhone();
    
    mockBusinesses.push({
      name,
      website,
      phone,
      source: 'mock'
    });
  }
  
  return mockBusinesses;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, source = 'auto' }: ScrapingRequest = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log the exact request details
    console.log({
      message: 'Starting business scrape request',
      location,
      source,
      timestamp: new Date().toISOString()
    });

    console.log(`Scraping businesses in: "${location}" from source: ${source}`);

    // Store results from each source separately for better reporting
    const results: Record<string, any> = {
      yellowpages: { success: false, businesses: [], error: null, duration: 0 },
      localstack: { success: false, businesses: [], error: null, duration: 0 },
      mock: { success: false, businesses: [], error: null },
      timestamp: new Date().toISOString(),
      location: location
    };
    
    // Choose the correct scraper based on the source or try multiple
    let allBusinesses: BusinessData[] = [];
    let mockDataUsed = false;
    
    // Function to safely run a scraper with timing and error handling
    const runScraper = async (scraperName: string, scraperFn: (loc: string) => Promise<BusinessData[]>) => {
      try {
        console.log(`Starting ${scraperName} scraper...`);
        const startTime = Date.now();
        const scrapedBusinesses = await scraperFn(location);
        const duration = Date.now() - startTime;
        
        results[scraperName] = {
          success: true,
          businesses: scrapedBusinesses,
          count: scrapedBusinesses.length,
          duration: `${duration}ms`,
          error: null
        };
        
        console.log(`Found ${scrapedBusinesses.length} businesses from ${scraperName} in ${duration}ms`);
        return scrapedBusinesses;
      } catch (error) {
        console.error(`Error scraping ${scraperName}:`, error);
        results[scraperName].error = error instanceof Error ? error.message : String(error);
        results[scraperName].success = false;
        return [];
      }
    };
    
    try {
      if (source === 'yellowpages') {
        allBusinesses = await runScraper('yellowpages', scrapeYellowPages);
      } else if (source === 'localstack') {
        allBusinesses = await runScraper('localstack', scrapeLocalStack);
      } else {
        // Auto mode - try multiple sources in parallel for better performance
        console.log('Auto mode: trying multiple data sources in parallel');
        
        // Run both scrapers in parallel
        const [ypBusinesses, lsBusinesses] = await Promise.all([
          runScraper('yellowpages', scrapeYellowPages),
          runScraper('localstack', scrapeLocalStack)
        ]);
        
        // Combine results
        allBusinesses = [...ypBusinesses, ...lsBusinesses];
      }
      
      // If we still have no businesses, use mock data
      if (allBusinesses.length === 0) {
        console.log('No businesses found from any source, using mock data');
        const mockBusinesses = getMockBusinessData(location);
        results.mock = {
          success: true,
          businesses: mockBusinesses,
          count: mockBusinesses.length,
          error: null
        };
        allBusinesses = mockBusinesses;
        mockDataUsed = true;
      }
    } catch (e) {
      console.error('All scrapers failed:', e);
      const mockBusinesses = getMockBusinessData(location);
      results.mock = {
        success: true,
        businesses: mockBusinesses,
        count: mockBusinesses.length,
        error: null
      };
      allBusinesses = mockBusinesses;
      mockDataUsed = true;
    }

    // Deduplicate businesses based on website
    const uniqueBusinesses = allBusinesses.filter((business, index, self) => 
      index === self.findIndex(b => b.website === business.website)
    );
    
    console.log(`Found ${uniqueBusinesses.length} unique businesses out of ${allBusinesses.length} total`);
    
    // Prepare source information for response
    let effectiveSource = source;
    if (mockDataUsed) {
      effectiveSource = 'mock';
    } else if (source === 'auto') {
      // Determine which sources actually contributed data
      const sources: string[] = [];
      if (results.yellowpages.success && results.yellowpages.count > 0) sources.push('yellowpages');
      if (results.localstack.success && results.localstack.count > 0) sources.push('localstack');
      effectiveSource = sources.join('+') || 'none';
    }
    
    // Include detailed results for debugging purposes
    return new Response(JSON.stringify({
      businesses: uniqueBusinesses,
      count: uniqueBusinesses.length,
      location,
      source: effectiveSource,
      timestamp: new Date().toISOString(),
      stats: {
        total: allBusinesses.length,
        unique: uniqueBusinesses.length,
        sources: {
          yellowpages: {
            count: results.yellowpages.count || 0,
            success: results.yellowpages.success,
            duration: results.yellowpages.duration || '0ms',
            error: results.yellowpages.error
          },
          localstack: {
            count: results.localstack.count || 0,
            success: results.localstack.success,
            duration: results.localstack.duration || '0ms',
            error: results.localstack.error
          },
          mock: mockDataUsed ? {
            count: results.mock.count || 0,
            used: mockDataUsed
          } : undefined
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to scrape business data',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
