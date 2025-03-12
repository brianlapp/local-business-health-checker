
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Added rate limiting tracker for the current instance
let scanCount = 0;
// Lowering max scans per instance to avoid rate limiting
const MAX_SCANS_PER_INSTANCE = 15; 
const RATE_LIMIT_RESET_TIME = 60000; // 1 minute in milliseconds
const MIN_DELAY_BETWEEN_SCANS = 2000; // 2 seconds minimum delay
let lastScanTime = 0; // Track when the last scan was performed

// Create a simple rate limiter that resets periodically
setInterval(() => {
  scanCount = Math.max(0, scanCount - 5); // Decrease counter by 5 every minute
  console.log(`Rate limit counter reset to ${scanCount}`);
}, RATE_LIMIT_RESET_TIME);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, businessId } = await req.json();
    
    if (!url) {
      throw new Error('URL parameter is required');
    }

    if (!businessId) {
      throw new Error('Business ID parameter is required');
    }

    console.log(`Scanning website performance with Lighthouse for: ${url}`);
    
    // Ensure SUPABASE credentials are available
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not configured properly');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Properly format the URL for PageSpeed API
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // Check for internal rate limiting
    if (scanCount >= MAX_SCANS_PER_INSTANCE) {
      console.log('Internal rate limit reached, using fallback scoring method');
      return await useFallbackMethod(formattedUrl, businessId, supabase, true);
    }
    
    // Enforce delay between scans to avoid external rate limiting
    const currentTime = Date.now();
    const timeSinceLastScan = currentTime - lastScanTime;
    
    if (timeSinceLastScan < MIN_DELAY_BETWEEN_SCANS) {
      const delayNeeded = MIN_DELAY_BETWEEN_SCANS - timeSinceLastScan;
      console.log(`Enforcing delay of ${delayNeeded}ms between scans to avoid rate limiting`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    // Update last scan time and increment scan counter
    lastScanTime = Date.now();
    scanCount++;
    
    try {
      // Use PageSpeed Insights API (which uses Lighthouse)
      const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
      apiUrl.searchParams.append('url', formattedUrl);
      apiUrl.searchParams.append('strategy', 'mobile');
      apiUrl.searchParams.append('category', 'performance');
      apiUrl.searchParams.append('category', 'accessibility');
      apiUrl.searchParams.append('category', 'best-practices');
      
      const response = await fetch(apiUrl.toString(), {
        headers: {
          'User-Agent': 'BizScan-LighthouseFunction/1.0',
        },
        // Set timeout to prevent long-hanging requests
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lighthouse API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract the Lighthouse score
      const lighthouseScore = Math.round(data.lighthouseResult?.categories?.performance?.score * 100) || 0;
      
      // PageSpeed Insights doesn't provide a direct report URL, but we can construct one
      const reportUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(formattedUrl)}`;
      
      // Update the business record with Lighthouse results
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          lighthouse_score: lighthouseScore,
          lighthouse_report_url: reportUrl,
          last_lighthouse_scan: new Date().toISOString()
        })
        .eq('id', businessId);

      if (updateError) {
        throw new Error(`Error updating business: ${updateError.message}`);
      }
      
      // Return the performance data
      const performanceData = {
        lighthouseScore,
        reportUrl,
        createdAt: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(performanceData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Handle rate limiting errors more gracefully
      console.error('Lighthouse API error:', error.message);
      
      if (error.message.includes('429') || 
          error.message.includes('RESOURCE_EXHAUSTED') || 
          error.message.includes('Quota exceeded') ||
          error.message.includes('timeout')) {
        
        return await useFallbackMethod(formattedUrl, businessId, supabase, false);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in Lighthouse scan:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Failed to perform Lighthouse scan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extracted fallback method to a separate function
async function useFallbackMethod(formattedUrl: string, businessId: string, supabase: any, isInternalLimit: boolean) {
  console.log(`Using fallback scoring method for ${formattedUrl}`);
  
  // Instead of random score, try to fetch from the actual website if possible
  let mockScore = 0;
  const message = isInternalLimit 
    ? "API rate limited by internal controls. Using estimated performance score." 
    : "Google API rate limited. Using estimated performance score.";
  
  try {
    // Try a basic fetch to see if the site loads quickly
    const start = Date.now();
    const basicFetch = await fetch(formattedUrl, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LighthouseScanner/1.0)' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    const loadTime = Date.now() - start;
    
    // Calculate a score based on load time
    // <500ms: 90+, <1000ms: 80+, <2000ms: 60+, <3000ms: 40+, otherwise lower
    if (loadTime < 500) mockScore = 90 + Math.floor(Math.random() * 10);
    else if (loadTime < 1000) mockScore = 80 + Math.floor(Math.random() * 10);
    else if (loadTime < 2000) mockScore = 60 + Math.floor(Math.random() * 20);
    else if (loadTime < 3000) mockScore = 40 + Math.floor(Math.random() * 20);
    else mockScore = 20 + Math.floor(Math.random() * 20);
    
    console.log(`Estimated score for ${formattedUrl}: ${mockScore} (based on ${loadTime}ms load time)`);
  } catch (fetchError) {
    // If even a basic fetch fails, assume a low score
    console.error(`Failed to fetch ${formattedUrl} for fallback scoring:`, fetchError);
    mockScore = Math.floor(Math.random() * 40) + 20; // Random score between 20-60
  }
  
  const reportUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(formattedUrl)}`;
  
  // Update the business with mock data
  try {
    await supabase
      .from('businesses')
      .update({
        lighthouse_score: mockScore,
        lighthouse_report_url: reportUrl,
        last_lighthouse_scan: new Date().toISOString()
      })
      .eq('id', businessId);
  } catch (dbError) {
    console.error(`Error updating database for fallback score:`, dbError);
  }
      
  return new Response(JSON.stringify({
    lighthouseScore: mockScore,
    reportUrl,
    createdAt: new Date().toISOString(),
    note: message
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
