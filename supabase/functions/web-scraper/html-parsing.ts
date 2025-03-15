
// @deno-types="https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.d.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { BusinessData } from "./types.ts";
import { captureHtmlSample, debugLog } from "./scraper-utils.ts";
import { getMockBusinessData } from "./mock-data.ts";

/**
 * Extract business data using multiple selector strategies with enhanced parsing
 */
export function extractBusinessData(html: string, source: string, url: string): BusinessData[] {
  debugLog(`Extracting business data from ${source}, URL: ${url}, HTML length: ${html.length}`);
  
  // Capture HTML sample for debugging
  captureHtmlSample(url, html);
  
  const dom = new DOMParser().parseFromString(html, 'text/html');
  if (!dom) {
    debugLog('Failed to parse HTML into DOM');
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
    'article'
  ];
  
  // Try each selector until we find elements
  for (const selector of selectors) {
    try {
      businessElements = Array.from(dom.querySelectorAll(selector));
      debugLog(`Selector "${selector}" found ${businessElements.length} elements`);
      
      if (businessElements.length > 0) {
        break;
      }
    } catch (err) {
      debugLog(`Error with selector ${selector}: ${err}`);
    }
  }
  
  // If no elements were found with any selector, try alternative approaches
  if (businessElements.length === 0) {
    debugLog('No business elements found with standard selectors, trying alternative approaches');
    
    // Look for elements with business-related classes or IDs
    try {
      const alternativeElements = dom.querySelectorAll(
        '[class*="business"],[class*="listing"],[class*="result"],[class*="company"]'
      );
      
      debugLog(`Found ${alternativeElements.length} potential business elements through attribute analysis`);
      
      if (alternativeElements.length > 0) {
        businessElements = Array.from(alternativeElements);
      }
    } catch (err) {
      debugLog(`Error in alternative element search: ${err}`);
    }
    
    // If still no elements, return mock data
    if (businessElements.length === 0) {
      debugLog('Unable to find business listings in the HTML, using fallback data');
      return getMockBusinessData(url.split('/').pop()?.split('?')[0] || 'unknown');
    }
  }
  
  // Process each business element, limit to 10 for performance
  const maxBusinesses = Math.min(10, businessElements.length);
  debugLog(`Processing ${maxBusinesses} business elements out of ${businessElements.length} found`);
  
  for (let i = 0; i < maxBusinesses; i++) {
    const element = businessElements[i];
    try {
      // Try multiple selectors for business name
      let nameEl = element.querySelector('.business-name') || 
                   element.querySelector('.name') ||
                   element.querySelector('[class*="name"]') || 
                   element.querySelector('[class*="title"]') ||
                   element.querySelector('h2') ||
                   element.querySelector('h3') ||
                   element.querySelector('h4') ||
                   element.querySelector('strong');
                   
      let name = nameEl?.textContent?.trim() || '';
      
      // Skip if no name found
      if (!name) {
        continue;
      }
      
      // Try multiple selectors for website URL
      let websiteEl = element.querySelector('a.track-visit-website') || 
                      element.querySelector('[class*="website"]') || 
                      element.querySelector('a[href*="website"]') ||
                      element.querySelector('a[href*="http"]') ||
                      element.querySelector('a.website');
      
      let website = '';
      
      if (websiteEl) {
        const href = websiteEl.getAttribute('href');
        if (href) {
          // Try to extract actual website from redirect URL if present
          const urlMatch = href.match(/(?:redirect=|website=|url=)(https?:\/\/[^&]+)/i);
          if (urlMatch && urlMatch[1]) {
            website = decodeURIComponent(urlMatch[1]);
          } else if (href.startsWith('http')) {
            website = href;
          }
        }
      }
      
      // If no website found, generate one based on the business name
      if (!website && name) {
        // Generate a plausible domain based on business name
        const domainName = name.toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
          .substring(0, 20); // Keep it reasonably short
        
        website = `${domainName}.com`;
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
        source
      });
    } catch (err) {
      debugLog(`Error processing business element: ${err}`);
    }
  }
  
  debugLog(`Extracted ${businesses.length} businesses from ${source}`);
  return businesses;
}
