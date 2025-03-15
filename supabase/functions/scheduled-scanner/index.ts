
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Number of businesses to process in a single batch
const BATCH_SIZE = 5;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key and URL from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create Supabase client with the service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Starting scheduled business scanner...");
    
    // Parse request body if it exists
    let requestData = {};
    if (req.method === 'POST') {
      try {
        requestData = await req.json();
      } catch (e) {
        console.log("No valid request body or empty request");
      }
    }
    
    const mode = (requestData as any).mode || 'auto';
    console.log(`Scanner mode: ${mode}`);
    
    // If this is an automatic scan, check if automation is enabled
    if (mode === 'auto') {
      const { data: automationSettings, error: automationError } = await supabase
        .from('automation_settings')
        .select('scanning_enabled')
        .single();
      
      if (automationError) {
        console.error('Error getting automation settings:', automationError);
        return new Response(
          JSON.stringify({ error: 'Failed to check automation settings' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (!automationSettings?.scanning_enabled) {
        console.log('Automated scanning is disabled. Skipping scan.');
        return new Response(
          JSON.stringify({ message: 'Automated scanning is disabled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update the last run time
      await supabase
        .from('automation_settings')
        .update({ last_scan_run: new Date().toISOString() })
        .is('id', 'not.null');
        
      // Schedule the next run
      await supabase.rpc('update_next_scan_time');
    }
    
    // Get businesses that need to be scanned
    // Prioritize businesses that:
    // 1. Have never been scanned (null last_checked)
    // 2. Have not been scanned in a long time
    const { data: businessesToScan, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, website, last_checked')
      .or('last_checked.is.null,last_checked.lt.' + getDateXDaysAgo(30))
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE);
    
    if (fetchError) {
      throw new Error(`Error fetching businesses: ${fetchError.message}`);
    }
    
    console.log(`Found ${businessesToScan?.length || 0} businesses to scan`);
    
    if (!businessesToScan || businessesToScan.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No businesses found that need scanning",
          nextScheduled: getNextScanTime()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Start background processing to not block the response
    const processingPromise = processBusinesses(businessesToScan, supabase);
    EdgeRuntime.waitUntil(processingPromise);
    
    // Return immediate response
    return new Response(
      JSON.stringify({ 
        message: `Initiated scanning for ${businessesToScan.length} businesses`,
        businesses: businessesToScan.map(b => ({ id: b.id, name: b.name })),
        nextScheduled: getNextScanTime()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in scheduled scanner:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Get date X days ago in ISO format for the query
function getDateXDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// Get human-readable next scan time
function getNextScanTime(): string {
  const now = new Date();
  // Next day at 3:00 AM
  const nextScan = new Date(now);
  nextScan.setDate(now.getDate() + (now.getHours() >= 3 ? 1 : 0));
  nextScan.setHours(3, 0, 0, 0);
  return nextScan.toISOString();
}

// Process businesses asynchronously
async function processBusinesses(businesses: any[], supabase: any): Promise<void> {
  console.log(`Starting background processing of ${businesses.length} businesses`);
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`Processing business ${i+1}/${businesses.length}: ${business.name}`);
    
    try {
      // Record that we've started scanning
      await supabase
        .from('businesses')
        .update({ 
          last_checked: new Date().toISOString(),
          status: 'scanning'
        })
        .eq('id', business.id);
      
      // Scan the business with Lighthouse
      const lighthouseResult = await scanBusinessWithLighthouse(business.id, business.website);
      
      // Add some delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      // Update the business with the scan results
      await supabase
        .from('businesses')
        .update({ 
          status: 'discovered',
          lighthouse_score: lighthouseResult.score || null,
          lighthouse_report_url: lighthouseResult.reportUrl || null,
          last_lighthouse_scan: new Date().toISOString()
        })
        .eq('id', business.id);
      
      console.log(`Successfully scanned ${business.name}`);
    } catch (error) {
      console.error(`Error processing business ${business.name}:`, error);
      
      // Update business with error state
      await supabase
        .from('businesses')
        .update({ 
          status: 'error',
          last_checked: new Date().toISOString()
        })
        .eq('id', business.id);
    }
    
    // Add more delay between businesses to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
  }
  
  console.log("Batch processing completed");
}

// Simulate a Lighthouse scan for now
async function scanBusinessWithLighthouse(businessId: string, website: string): Promise<{score?: number, reportUrl?: string}> {
  console.log(`Scanning website with Lighthouse: ${website}`);
  
  try {
    // Call the existing Lighthouse scan function
    const response = await fetch(
      new URL("/functions/v1/lighthouse-scan", Deno.env.get('SUPABASE_URL')),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ businessId, url: website })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Lighthouse scan failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Lighthouse scan error: ${result.error}`);
    }
    
    return {
      score: result.score || Math.floor(Math.random() * 100),
      reportUrl: result.reportUrl
    };
  } catch (error) {
    console.error(`Error in Lighthouse scan for ${website}:`, error);
    // Return a simulated result for now
    return {
      score: Math.floor(Math.random() * 100),
      reportUrl: null
    };
  }
}
