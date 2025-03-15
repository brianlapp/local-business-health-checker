
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ScrapingRequest, ScraperResponse } from "./types.ts";
import { 
  corsHeaders, 
  debugLog, 
  getDebugData, 
  resetDebugData,
  setDebugMode
} from "./scraper-utils.ts";
import { scrapeYellowPages, scrapeLocalStack } from "./directory-scrapers.ts";
import { getMockBusinessData } from "./mock-data.ts";

// Main handler function
serve(async (req) => {
  // Reset debug variables
  resetDebugData();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, source = 'auto', debug = false }: ScrapingRequest = await req.json();
    
    // Set debug mode
    setDebugMode(debug);
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    debugLog(`Starting business scrape for: "${location}" using source: ${source} with debug mode: ${debug ? 'ON' : 'OFF'}`);

    // Set a global timeout for the entire operation
    let timedOut = false;
    const globalTimeout = setTimeout(() => {
      timedOut = true;
      debugLog('GLOBAL TIMEOUT: Execution approaching 30 second limit, returning partial results');
    }, 30000); // 30 second timeout (well under the 60s limit)

    // Choose the correct scraper based on the source
    let businesses = [];
    
    try {
      if (source === 'yellowpages') {
        businesses = await scrapeYellowPages(location);
      } else if (source === 'localstack') {
        businesses = await scrapeLocalStack(location);
      } else {
        // Auto mode - try multiple sources but with a race
        debugLog('Auto mode: trying both YellowPages and LocalStack with race');
        
        // Set up Promise.race to use whichever source responds first
        const result = await Promise.race([
          scrapeYellowPages(location).then(data => ({ source: 'yellowpages', data })),
          scrapeLocalStack(location).then(data => ({ source: 'localstack', data }))
        ]);
        
        debugLog(`Race completed, winner: ${result.source}`);
        businesses = result.data;
      }
    } catch (e) {
      debugLog('Error running scrapers:', e);
      businesses = getMockBusinessData(location);
    }
    
    clearTimeout(globalTimeout);
    
    // If we timed out or have no businesses, use mock data
    if (timedOut || businesses.length === 0) {
      debugLog(`${timedOut ? 'Timed out' : 'No businesses found'}, using mock data`);
      businesses = getMockBusinessData(location);
    }
    
    // Deduplicate businesses
    const uniqueBusinesses = businesses.filter((business, index, self) => 
      index === self.findIndex(b => b.website === business.website)
    );
    
    debugLog(`Returning ${uniqueBusinesses.length} unique businesses`);
    
    // Prepare response object
    const responseObj: ScraperResponse = {
      businesses: uniqueBusinesses,
      count: uniqueBusinesses.length,
      location,
      source: businesses[0]?.source || source,
      timestamp: new Date().toISOString(),
    };
    
    // Add debug information if debug mode was enabled
    if (debug) {
      responseObj.debug = getDebugData();
      debugLog('Including debug info in response');
    }
    
    return new Response(JSON.stringify(responseObj), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Error processing request:', errorMessage);
    
    // Return error with any debug logs we collected
    const responseObj: ScraperResponse = {
      businesses: [],
      count: 0,
      location: '',
      source: 'error',
      error: 'Failed to scrape business data',
      details: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    if (isDebugMode()) {
      responseObj.debug = getDebugData();
    }
    
    return new Response(JSON.stringify(responseObj), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
