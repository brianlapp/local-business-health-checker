
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const GTMETRIX_API_KEY = Deno.env.get('GTMETRIX_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    console.log(`Scanning website performance with GTmetrix for: ${url}`);
    
    // Check if we have scans left for this month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get or create the usage record for this month
    let { data: usageData, error: usageError } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .eq('month', currentMonth)
      .single();
    
    if (usageError) {
      // Record doesn't exist yet, create it
      const { data: newUsage, error: createError } = await supabase
        .from('gtmetrix_usage')
        .insert({ month: currentMonth, scans_used: 0 })
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Error creating usage record: ${createError.message}`);
      }
      
      usageData = newUsage;
    }
    
    // Check if we've hit the scan limit
    if (usageData.scans_used >= usageData.scans_limit) {
      return new Response(JSON.stringify({ 
        error: 'Monthly GTmetrix scan limit reached',
        scansUsed: usageData.scans_used,
        scansLimit: usageData.scans_limit 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create a test
    const testResponse = await fetch('https://gtmetrix.com/api/0.1/test', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(GTMETRIX_API_KEY + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        report: { protocol: 'lighthouse' }
      })
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      throw new Error(`GTmetrix API error: ${errorText}`);
    }
    
    const testData = await testResponse.json();
    const testId = testData.data.id;
    
    console.log(`Test created with ID: ${testId}`);
    
    // Poll for test completion
    let testResults;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      console.log(`Polling for test results, attempt ${attempts + 1}...`);
      
      const pollResponse = await fetch(`https://gtmetrix.com/api/0.1/test/${testId}`, {
        headers: {
          'Authorization': `Basic ${btoa(GTMETRIX_API_KEY + ':')}`
        }
      });
      
      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`GTmetrix API polling error: ${errorText}`);
      }
      
      const pollData = await pollResponse.json();
      
      if (pollData.data.state === 'completed') {
        testResults = pollData;
        break;
      } else if (pollData.data.state === 'error') {
        throw new Error(`GTmetrix test error: ${pollData.data.error}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    if (!testResults) {
      throw new Error('Test did not complete within the allocated time');
    }
    
    console.log('Test completed successfully');
    
    // Extract performance metrics
    const speedScore = testResults.data.attributes?.lighthouse_scores?.performance || 0;
    const fullyLoadedTime = testResults.data.attributes?.fully_loaded_time || 0;
    const reportUrl = testResults.data.links?.report_url || '';

    // Update the business record with GTmetrix results
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        gtmetrix_score: speedScore,
        gtmetrix_report_url: reportUrl,
        last_gtmetrix_scan: new Date().toISOString()
      })
      .eq('id', businessId);

    if (updateError) {
      throw new Error(`Error updating business: ${updateError.message}`);
    }

    // Increment the scan usage counter
    const { error: incrementError } = await supabase
      .from('gtmetrix_usage')
      .update({
        scans_used: usageData.scans_used + 1,
        last_updated: new Date().toISOString()
      })
      .eq('month', currentMonth);

    if (incrementError) {
      throw new Error(`Error updating scan usage: ${incrementError.message}`);
    }
    
    const performanceData = {
      speedScore,
      fullyLoadedTime,
      reportUrl,
      scansUsed: usageData.scans_used + 1,
      scansLimit: usageData.scans_limit,
      createdAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(performanceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GTmetrix scan:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
