
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GTMETRIX_API_KEY = Deno.env.get('GTMETRIX_API_KEY');

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
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL parameter is required');
    }

    console.log(`Scanning website performance for: ${url}`);
    
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
    const performanceData = {
      speedScore: testResults.data.attributes?.lighthouse_scores?.performance || 0,
      fullyLoadedTime: testResults.data.attributes?.fully_loaded_time || 0,
      reportUrl: testResults.data.links?.report_url || '',
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
