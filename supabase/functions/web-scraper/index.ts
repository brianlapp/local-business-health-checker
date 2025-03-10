
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingRequest {
  location: string;
  source?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, source = 'yellowpages' }: ScrapingRequest = await req.json();
    console.log(`Scraping businesses in: "${location}" from source: ${source}`);

    // Choose the correct scraper based on the source
    let businesses = [];
    switch(source) {
      case 'yellowpages':
        businesses = await scrapeYellowPages(location);
        break;
      default:
        businesses = await scrapeYellowPages(location); // Default to YellowPages
    }

    console.log(`Found ${businesses.length} businesses with websites`);

    return new Response(JSON.stringify({ 
      businesses,
      status: 'OK',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in web scraper:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      message: 'There was a problem processing your request',
      businesses: [],
    }), {
      status: 200, // Return 200 to prevent edge function error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scrapeYellowPages(location: string): Promise<any[]> {
  try {
    const formattedLocation = encodeURIComponent(location.trim());
    const url = `https://www.yellowpages.com/search?search_terms=businesses&geo_location_terms=${formattedLocation}`;
    
    console.log(`Scraping URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch YellowPages: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const dom = new DOMParser().parseFromString(html, 'text/html');
    
    if (!dom) {
      throw new Error('Failed to parse HTML');
    }
    
    const businesses = [];
    const businessElements = dom.querySelectorAll('.result');
    
    for (let i = 0; i < businessElements.length; i++) {
      const element = businessElements[i];
      
      // Extract business name
      const nameElement = element.querySelector('.business-name');
      if (!nameElement) continue;
      const name = nameElement.textContent.trim();
      
      // Extract website URL if available
      const websiteElement = element.querySelector('a.track-visit-website');
      if (!websiteElement) continue; // Skip businesses without websites
      
      // Yellow Pages uses a redirect URL, so we need to extract the actual URL
      const redirectUrl = websiteElement.getAttribute('href');
      if (!redirectUrl) continue;
      
      // Get actual website by following redirect (or at least try to extract from redirect URL)
      let website = '';
      try {
        // Try to extract from the redirectUrl if it contains the actual URL as a parameter
        const urlMatch = redirectUrl.match(/(?:redirect=|website=)(https?:\/\/[^&]+)/i);
        if (urlMatch && urlMatch[1]) {
          website = decodeURIComponent(urlMatch[1]).replace(/^https?:\/\//, '');
        } else {
          // If we can't extract from the URL, try to follow the redirect
          const redirectResponse = await fetch(redirectUrl, {
            method: 'HEAD',
            redirect: 'manual',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
          });
          
          // Check for redirect headers
          const location = redirectResponse.headers.get('location');
          if (location) {
            website = location.replace(/^https?:\/\//, '');
          }
        }
      } catch (err) {
        console.error(`Error following redirect for ${name}:`, err);
        continue; // Skip this business if we can't get the website
      }
      
      // Only add businesses where we successfully got a website
      if (website) {
        businesses.push({
          name,
          website: website.replace(/\/$/, ''), // Remove trailing slash
          source: 'yellowpages'
        });
      }
    }
    
    return businesses;
  } catch (error) {
    console.error('Error scraping YellowPages:', error);
    throw error;
  }
}
