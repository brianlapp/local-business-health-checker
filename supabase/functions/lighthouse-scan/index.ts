
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Rate limiting configuration
let scanCount = 0;
const MAX_SCANS_PER_INSTANCE = 15; // Maximum scans per instance
const RATE_LIMIT_RESET_TIME = 60000; // 1 minute in milliseconds
const MIN_DELAY_BETWEEN_SCANS = 2000; // 2 seconds minimum delay
const BACKOFF_PERIOD = 300000; // 5 minutes backoff if rate limited
let lastScanTime = 0;
let rateLimitedUntil = 0; // Timestamp when we can resume after hitting rate limit

// Reset counter periodically
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
    
    // Check if we're currently in a backoff period due to rate limiting
    const currentTime = Date.now();
    if (rateLimitedUntil > currentTime) {
      const waitTime = Math.ceil((rateLimitedUntil - currentTime) / 60000); // minutes
      console.log(`In rate limit backoff period. Resuming in ~${waitTime} minutes.`);
      
      // Return a specific rate limit response
      return new Response(JSON.stringify({
        success: false,
        error: "Rate limited",
        note: `Rate limited. Resuming in ~${waitTime} minutes.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429
      });
    }
    
    // Check for internal rate limiting
    if (scanCount >= MAX_SCANS_PER_INSTANCE) {
      console.log('Internal rate limit reached, queuing for later');
      
      // Return a specific rate limit response
      return new Response(JSON.stringify({
        success: false,
        error: "Internal rate limit",
        note: "Too many requests. Please try again later."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429
      });
    }
    
    // Enforce delay between scans to avoid external rate limiting
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
        
        // Handle rate limit errors
        if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('Quota exceeded')) {
          // Set a backoff period before we try again
          rateLimitedUntil = Date.now() + BACKOFF_PERIOD;
          console.log(`Rate limit hit. Setting backoff until ${new Date(rateLimitedUntil).toISOString()}`);
          
          const waitTime = Math.ceil(BACKOFF_PERIOD / 60000); // minutes
          return new Response(JSON.stringify({
            success: false,
            error: "Rate limited by Google API",
            note: `Rate limited. Resuming in ~${waitTime} minutes.`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          });
        }
        
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
        success: true,
        lighthouseScore,
        reportUrl,
        createdAt: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(performanceData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Handle specific error cases
      console.error('Lighthouse API error:', error.message);
      
      if (error.message.includes('429') || 
          error.message.includes('RESOURCE_EXHAUSTED') || 
          error.message.includes('Quota exceeded')) {
        
        // Set a backoff period before we try again
        rateLimitedUntil = Date.now() + BACKOFF_PERIOD;
        console.log(`Rate limit hit. Setting backoff until ${new Date(rateLimitedUntil).toISOString()}`);
        
        const waitTime = Math.ceil(BACKOFF_PERIOD / 60000); // minutes
        return new Response(JSON.stringify({
          success: false,
          error: "Rate limited by Google API",
          note: `Rate limited. Resuming in ~${waitTime} minutes.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429
        });
      } else if (error.message.includes('timeout')) {
        return new Response(JSON.stringify({
          success: false,
          error: "Request timed out",
          note: `Request timed out. Please try again later.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 408
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in Lighthouse scan:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      message: 'Failed to perform Lighthouse scan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
