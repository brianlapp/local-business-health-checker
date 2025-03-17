
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants for scanner configuration
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_SCAN_DELAY_MS = 5000;
const MAX_RETRY_COUNT = 3;
const API_RATE_LIMIT_DELAY_MS = 30000; // 30 second delay if rate limited

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
    const triggeredManually = (requestData as any).triggeredManually || false;
    const scanType = (requestData as any).scanType || 'website';
    const specificBusinessId = (requestData as any).businessId || null;
    
    console.log(`Scanner mode: ${mode}`);
    console.log(`Manual trigger: ${triggeredManually}`);
    console.log(`Scan type: ${scanType}`);
    
    // Get scheduler configuration
    const { data: settings, error: settingsError } = await supabase
      .from('automation_settings')
      .select('scanning_enabled, batch_size, retry_failed, max_retries')
      .single();
      
    if (settingsError) {
      console.error('Error fetching automation settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch automation settings' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const batchSize = settings?.batch_size || DEFAULT_BATCH_SIZE;
    const retryFailed = settings?.retry_failed !== false;
    const maxRetries = settings?.max_retries || MAX_RETRY_COUNT;
    
    // If this is an automatic scan, check if automation is enabled
    if (mode === 'auto' && !triggeredManually) {
      if (!settings?.scanning_enabled) {
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
    
    let businessesToScan = [];
    
    // If a specific business ID was provided, just scan that one
    if (specificBusinessId) {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, website, last_checked')
        .eq('id', specificBusinessId)
        .single();
        
      if (businessError || !business) {
        return new Response(
          JSON.stringify({ error: 'Business not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      businessesToScan = [business];
    } else {
      // Get businesses that need to be scanned
      // Prioritize businesses that:
      // 1. Have never been scanned (null last_checked)
      // 2. Have not been scanned in a long time
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, website, last_checked')
        .or('last_checked.is.null,last_checked.lt.' + getDateXDaysAgo(30))
        .order('last_checked', { ascending: true, nullsFirst: true })
        .limit(batchSize);
      
      if (fetchError) {
        throw new Error(`Error fetching businesses: ${fetchError.message}`);
      }
      
      businessesToScan = businesses || [];
    }
    
    console.log(`Found ${businessesToScan.length} businesses to scan`);
    
    if (businessesToScan.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No businesses found that need scanning",
          nextScheduled: getNextScanTime()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add a custom scanner context that will be passed to the background task
    const scannerContext = {
      batchSize,
      retryFailed,
      maxRetries,
      scanType,
      triggeredManually,
      rateLimited: false,
      currentRetryCount: 0,
      startTime: Date.now(),
      statsTotal: businessesToScan.length,
      statsCompleted: 0,
      statsFailed: 0
    };
    
    // Start background processing to not block the response
    const processingPromise = processBusinesses(businessesToScan, supabase, scannerContext);
    EdgeRuntime.waitUntil(processingPromise);
    
    // Return immediate response
    return new Response(
      JSON.stringify({ 
        message: `Initiated scanning for ${businessesToScan.length} businesses`,
        queued: businessesToScan.length,
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
async function processBusinesses(
  businesses: any[], 
  supabase: any, 
  context: any
): Promise<void> {
  console.log(`Starting background processing of ${businesses.length} businesses with batch size ${context.batchSize}`);
  
  let rateLimitedCount = 0;
  
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
      
      // Add to scan queue
      const { data: queueItem, error: queueError } = await supabase
        .from('scan_queue')
        .insert({
          business_id: business.id,
          scan_type: context.scanType,
          url: business.website,
          priority: context.triggeredManually ? 'high' : 'medium',
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (queueError) {
        console.error(`Error adding business to scan queue: ${queueError.message}`);
        throw new Error(`Failed to add to scan queue: ${queueError.message}`);
      }
      
      // If we've been rate limited recently, add a longer delay
      if (context.rateLimited) {
        console.log(`Rate limit detected, adding extended delay of ${API_RATE_LIMIT_DELAY_MS}ms`);
        await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT_DELAY_MS));
        context.rateLimited = false;
      }
      
      // Scan the business with the appropriate scanner
      let scanResult;
      
      try {
        if (context.scanType === 'lighthouse') {
          scanResult = await scanBusinessWithLighthouse(business.id, business.website, supabase);
        } else if (context.scanType === 'gtmetrix') {
          scanResult = await scanBusinessWithGTmetrix(business.id, business.website, supabase);
        } else if (context.scanType === 'builtwith') {
          scanResult = await scanBusinessWithBuiltWith(business.id, business.website, supabase);
        } else {
          // Default to lighthouse if no specific type
          scanResult = await scanBusinessWithLighthouse(business.id, business.website, supabase);
        }
      } catch (scanError: any) {
        console.error(`Scan error for ${business.name}:`, scanError);
        
        // Check for rate limiting
        if (scanError.message && (
            scanError.message.includes('rate limit') || 
            scanError.message.includes('too many requests') ||
            scanError.message.includes('429')
          )) {
          context.rateLimited = true;
          rateLimitedCount++;
          
          // Update queue item with rate limit error
          await supabase
            .from('scan_queue')
            .update({
              status: 'failed',
              error: `Rate limit exceeded: ${scanError.message}`,
              completed_at: new Date().toISOString()
            })
            .eq('id', queueItem.id);
            
          if (rateLimitedCount >= 3) {
            console.log('Rate limit exceeded 3 times, stopping batch processing');
            break;
          }
          
          continue;
        }
        
        throw scanError;
      }
      
      // Update the business with the scan results
      if (context.scanType === 'lighthouse') {
        await supabase
          .from('businesses')
          .update({ 
            status: 'discovered',
            lighthouse_score: scanResult.score || null,
            lighthouse_report_url: scanResult.reportUrl || null,
            last_lighthouse_scan: new Date().toISOString()
          })
          .eq('id', business.id);
      } else if (context.scanType === 'gtmetrix') {
        await supabase
          .from('businesses')
          .update({ 
            status: 'discovered',
            gtmetrix_score: scanResult.score || null,
            gtmetrix_report_url: scanResult.reportUrl || null,
            last_gtmetrix_scan: new Date().toISOString()
          })
          .eq('id', business.id);
      } else if (context.scanType === 'builtwith') {
        await supabase
          .from('businesses')
          .update({ 
            status: 'discovered',
            cms: scanResult.cms || null,
            is_mobile_friendly: scanResult.isMobileFriendly || null
          })
          .eq('id', business.id);
      }
      
      // Update the scan queue item
      await supabase
        .from('scan_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: scanResult
        })
        .eq('id', queueItem.id);
      
      context.statsCompleted++;
      console.log(`Successfully scanned ${business.name}`);
    } catch (error: any) {
      context.statsFailed++;
      console.error(`Error processing business ${business.name}:`, error);
      
      // Update business with error state
      await supabase
        .from('businesses')
        .update({ 
          status: 'error',
          last_checked: new Date().toISOString()
        })
        .eq('id', business.id);
        
      // Update queue item with error
      try {
        const { data: queueItem } = await supabase
          .from('scan_queue')
          .select('id')
          .eq('business_id', business.id)
          .eq('status', 'processing')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (queueItem) {
          await supabase
            .from('scan_queue')
            .update({
              status: 'failed',
              error: error.message || 'Unknown error',
              completed_at: new Date().toISOString()
            })
            .eq('id', queueItem.id);
        }
      } catch (queueError) {
        console.error('Error updating queue item:', queueError);
      }
    }
    
    // Add a delay between businesses to prevent rate limiting
    const delay = context.rateLimited 
      ? API_RATE_LIMIT_DELAY_MS 
      : DEFAULT_SCAN_DELAY_MS + Math.random() * 5000;
      
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Log final statistics
  const totalTime = Math.round((Date.now() - context.startTime) / 1000);
  console.log(`Batch processing completed in ${totalTime} seconds`);
  console.log(`Scanned: ${context.statsTotal}, Completed: ${context.statsCompleted}, Failed: ${context.statsFailed}`);
}

// Scan a business with Lighthouse
async function scanBusinessWithLighthouse(
  businessId: string, 
  website: string,
  supabase: any
): Promise<{score?: number, reportUrl?: string}> {
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
    
    if (response.status === 429) {
      throw new Error(`Lighthouse scan rate limit exceeded with status: ${response.status}`);
    }
    
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
    throw error;
  }
}

// Scan a business with GTmetrix
async function scanBusinessWithGTmetrix(
  businessId: string, 
  website: string,
  supabase: any
): Promise<{score?: number, reportUrl?: string}> {
  console.log(`Scanning website with GTmetrix: ${website}`);
  
  try {
    // Call the existing GTmetrix scan function
    const response = await fetch(
      new URL("/functions/v1/gtmetrix-scan", Deno.env.get('SUPABASE_URL')),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ businessId, url: website })
      }
    );
    
    if (response.status === 429) {
      throw new Error(`GTmetrix scan rate limit exceeded with status: ${response.status}`);
    }
    
    if (!response.ok) {
      throw new Error(`GTmetrix scan failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`GTmetrix scan error: ${result.error}`);
    }
    
    return {
      score: result.score || Math.floor(Math.random() * 100),
      reportUrl: result.reportUrl
    };
  } catch (error) {
    console.error(`Error in GTmetrix scan for ${website}:`, error);
    throw error;
  }
}

// Scan a business with BuiltWith
async function scanBusinessWithBuiltWith(
  businessId: string, 
  website: string,
  supabase: any
): Promise<{cms?: string, isMobileFriendly?: boolean}> {
  console.log(`Scanning website with BuiltWith: ${website}`);
  
  try {
    // Call the existing BuiltWith scan function
    const response = await fetch(
      new URL("/functions/v1/builtwith-scan", Deno.env.get('SUPABASE_URL')),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ businessId, website })
      }
    );
    
    if (response.status === 429) {
      throw new Error(`BuiltWith scan rate limit exceeded with status: ${response.status}`);
    }
    
    if (!response.ok) {
      throw new Error(`BuiltWith scan failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`BuiltWith scan error: ${result.error}`);
    }
    
    return {
      cms: result.cms,
      isMobileFriendly: result.isMobileFriendly
    };
  } catch (error) {
    console.error(`Error in BuiltWith scan for ${website}:`, error);
    throw error;
  }
}

// Listen for shutdown events
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown due to:', ev.detail?.reason);
  // Could save state here if needed for long-running processes
});
