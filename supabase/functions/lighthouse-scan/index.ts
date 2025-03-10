
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

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

    console.log(`Scanning website performance with Lighthouse for: ${url}`);
    
    // Use PageSpeed Insights API (which uses Lighthouse)
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.append('url', url.startsWith('http') ? url : `https://${url}`);
    apiUrl.searchParams.append('strategy', 'mobile');
    
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse API error: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract the Lighthouse score
    const lighthouseScore = Math.round(data.lighthouseResult?.categories?.performance?.score * 100) || 0;
    
    // PageSpeed Insights doesn't provide a direct report URL, but we can construct one
    const reportUrl = `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
    
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
    console.error('Error in Lighthouse scan:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
