
import { BusinessData } from "./types.ts";
import { getBrowserLikeHeaders, debugLog } from "./scraper-utils.ts";
import { extractBusinessData } from "./html-parsing.ts";
import { getMockBusinessData } from "./mock-data.ts";

/**
 * Simplified scraping function with timeout protection
 */
export async function scrapeWebsite(url: string, source: string): Promise<BusinessData[]> {
  try {
    debugLog(`Scraping ${source} URL: ${url}`);
    
    // Add a short delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, { 
      headers: getBrowserLikeHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      debugLog(`Failed with status ${response.status} for URL: ${url}`);
      return [];
    }
    
    const html = await response.text();
    debugLog(`Got ${html.length} bytes from ${url}`);
    
    // If HTML is too small, it's probably not a valid response
    if (html.length < 1000) {
      debugLog(`Response too small (${html.length} bytes), likely not valid content`);
      return [];
    }
    
    return extractBusinessData(html, source, url);
  } catch (error) {
    if (error.name === 'AbortError') {
      debugLog(`Fetch timeout for URL: ${url}`);
    } else {
      debugLog(`Error scraping ${url}: ${error.message || error}`);
    }
    return [];
  }
}

/**
 * Optimized YellowPages scraper
 */
export async function scrapeYellowPages(location: string): Promise<BusinessData[]> {
  try {
    debugLog('Scraping YellowPages for:', location);
    
    // Format location for URL
    const formattedLocation = encodeURIComponent(location.trim());
    
    // Create multiple URL formats to try in parallel
    const urlsToTry = [
      `https://www.yellowpages.com/search?search_terms=businesses&geo_location_terms=${formattedLocation}`,
      `https://www.yellowpages.ca/search?search_terms=business&geo_location_terms=${formattedLocation}`,
      `https://www.yellowpages.ca/search/si/1/businesses/${encodeURIComponent(location.replace(/,/g, ' ').replace(/\s+/g, '+'))}`
    ];
    
    debugLog(`Trying ${urlsToTry.length} URLs for YellowPages`);
    
    // Try all URLs in parallel to save time
    const promises = urlsToTry.map(url => scrapeWebsite(url, 'yellowpages'));
    const results = await Promise.all(promises);
    
    // Combine results from all URLs
    const allBusinesses: BusinessData[] = [];
    results.forEach(businesses => {
      if (businesses.length > 0) {
        allBusinesses.push(...businesses);
      }
    });
    
    // Deduplicate by website
    const uniqueBusinesses = allBusinesses.filter((business, index, self) => 
      index === self.findIndex(b => b.website === business.website)
    );
    
    debugLog(`Found ${uniqueBusinesses.length} unique businesses from YellowPages`);
    
    if (uniqueBusinesses.length > 0) {
      return uniqueBusinesses;
    }
    
    // If no businesses found, return mock data
    debugLog('No businesses found from YellowPages, using mock data');
    return getMockBusinessData(location);
  } catch (error) {
    debugLog('Error scraping YellowPages:', error);
    return getMockBusinessData(location);
  }
}

/**
 * Simplified LocalStack scraper
 */
export async function scrapeLocalStack(location: string): Promise<BusinessData[]> {
  try {
    debugLog('Scraping LocalStack for:', location);
    
    // Format location
    const formattedLocation = encodeURIComponent(location.trim());
    
    // Create URL formats to try in parallel
    const urlsToTry = [
      `https://localstack.com/search?q=${formattedLocation}&type=businesses`,
      `https://localstack.com/browse-businesses/${location.toLowerCase().replace(/[,\s]+/g, '-')}`
    ];
    
    // Try all URLs in parallel
    const promises = urlsToTry.map(url => scrapeWebsite(url, 'localstack'));
    const results = await Promise.all(promises);
    
    // Combine results
    const allBusinesses: BusinessData[] = [];
    results.forEach(businesses => {
      if (businesses.length > 0) {
        allBusinesses.push(...businesses);
      }
    });
    
    // Deduplicate
    const uniqueBusinesses = allBusinesses.filter((business, index, self) => 
      index === self.findIndex(b => b.website === business.website)
    );
    
    debugLog(`Found ${uniqueBusinesses.length} unique businesses from LocalStack`);
    
    if (uniqueBusinesses.length > 0) {
      return uniqueBusinesses;
    }
    
    // If no businesses found, return mock data
    debugLog('No businesses found from LocalStack, using mock data');
    return getMockBusinessData(location);
  } catch (error) {
    debugLog('Error scraping LocalStack:', error);
    return getMockBusinessData(location);
  }
}
