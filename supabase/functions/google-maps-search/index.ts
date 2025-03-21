
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

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
    // Log environment details for debugging
    console.log(`Function invoked. API key exists: ${Boolean(GOOGLE_MAPS_API_KEY)}`);
    if (GOOGLE_MAPS_API_KEY) {
      console.log(`API key first 5 chars: ${GOOGLE_MAPS_API_KEY.substring(0, 5)}...`);
      console.log(`API key length: ${GOOGLE_MAPS_API_KEY.length} characters`);
    } else {
      console.error('Google Maps API key is not set');
    }
    
    // Validate API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not set');
      return new Response(JSON.stringify({ 
        error: 'Google Maps API key is not configured',
        message: 'Please set a valid Google Maps API key in the Supabase Edge Function secrets',
        test_mode: true,
        businesses: []
      }), {
        status: 200, // Always return 200 to prevent edge function errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { location, radius, limit } = await req.json();
    
    if (!location) {
      return new Response(JSON.stringify({
        error: 'Location parameter is required',
        test_mode: true,
        businesses: []
      }), {
        status: 200, // Always return 200
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure radius is a number with default
    const radiusInMeters = (parseInt(radius) || 10) * 1000; // Convert km to meters
    // Ensure limit is a number with default
    const resultsLimit = parseInt(limit) || 20;

    console.log(`Searching for businesses in: "${location}" within ${radiusInMeters/1000}km radius, limit: ${resultsLimit}`);
    
    // Use the Places API for better business search
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.append('query', `businesses in ${location}`);
    searchUrl.searchParams.append('radius', radiusInMeters.toString());
    searchUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    
    console.log(`Places API Request URL: ${searchUrl.toString().replace(GOOGLE_MAPS_API_KEY, 'REDACTED')}`);
    
    try {
      const searchResponse = await fetch(searchUrl.toString());
      
      console.log(`Google API HTTP Status: ${searchResponse.status} ${searchResponse.statusText}`);
      
      // Check if the response is ok before getting JSON
      if (!searchResponse.ok) {
        console.error(`Failed to fetch data: ${searchResponse.status} ${searchResponse.statusText}`);
        const responseText = await searchResponse.text();
        console.error(`Response body: ${responseText}`);
        
        return new Response(JSON.stringify({
          error: `Google API request failed with status: ${searchResponse.status}`,
          message: 'Failed to connect to Google Maps API. This could be due to billing issues with your Google Cloud account.',
          details: responseText,
          test_mode: true,
          businesses: []
        }), {
          status: 200, // Always return 200
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const searchData = await searchResponse.json();
      
      console.log(`Google Maps API response status: ${searchData.status}`);
      console.log(`Response details: ${JSON.stringify(searchData, null, 2).substring(0, 500)}...`);
      
      // Handle API errors - specifically watch for billing-related issues
      if (searchData.status === 'REQUEST_DENIED') {
        console.error(`Authorization error: ${searchData.error_message || 'This API project is not authorized to use this API.'}`);
        
        // Check for specific billing-related messages
        const errorMessage = searchData.error_message || '';
        const isBillingIssue = errorMessage.includes('billing') || 
                              errorMessage.includes('payment') || 
                              errorMessage.includes('not authorized') ||
                              errorMessage.includes('API project') ||
                              errorMessage.toLowerCase().includes('enabled');
        
        // Check for API not enabled message
        const isApiNotEnabled = errorMessage.toLowerCase().includes('not enabled') || 
                               errorMessage.toLowerCase().includes('enable it');
        
        let troubleshooting = '';
        if (isApiNotEnabled) {
          troubleshooting = 'You need to enable the Places API in your Google Cloud Console. Go to https://console.cloud.google.com/apis/library/places-backend.googleapis.com and click "Enable".';
        } else if (isBillingIssue) {
          troubleshooting = 'Check your payment method and billing status in Google Cloud Console. Make sure you have a valid credit card on file and billing is enabled.';
        }
        
        return new Response(JSON.stringify({ 
          error: 'Google Maps API authorization error',
          message: isApiNotEnabled 
            ? 'The Places API is not enabled in your Google Cloud project.' 
            : (isBillingIssue 
                ? 'Your Google Cloud account has a billing issue.' 
                : 'API key may have other authorization issues.'),
          troubleshooting: troubleshooting,
          details: 'Error from Google: ' + searchData.error_message,
          test_mode: true,
          businesses: []
        }), {
          status: 200, // Return 200 to prevent edge function error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (searchData.status !== 'OK') {
        console.error(`Google Places API error: ${searchData.error_message || searchData.status}`);
        
        return new Response(JSON.stringify({
          error: `Google Maps API error: ${searchData.status}`,
          message: searchData.error_message || 'Failed to search for businesses',
          test_mode: true,
          businesses: [],
        }), {
          status: 200, // Return 200 to prevent edge function error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Process the results to get business data
      const businesses = [];
      const logs = [];
      const htmlSamples = [];
      
      // Limit to the requested number of results
      const placesToProcess = searchData.results.slice(0, resultsLimit);
      
      logs.push(`Found ${searchData.results.length} total places, processing ${placesToProcess.length} based on limit`);
      
      for (const place of placesToProcess) {
        // If the place has a name, consider it a business
        if (place.name) {
          logs.push(`Processing place: ${place.name}`);
          
          // Places API doesn't always return website URLs directly, get details for websites
          if (place.place_id) {
            const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
            detailsUrl.searchParams.append('place_id', place.place_id);
            detailsUrl.searchParams.append('fields', 'name,website,formatted_address,types,rating,user_ratings_total');
            detailsUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
            
            try {
              logs.push(`Fetching details for place_id: ${place.place_id}`);
              
              const detailsResponse = await fetch(detailsUrl.toString());
              
              if (!detailsResponse.ok) {
                logs.push(`Error: Failed to fetch details: ${detailsResponse.status}`);
                continue;
              }
              
              const detailsData = await detailsResponse.json();
              
              if (detailsData.status === 'OK' && detailsData.result) {
                const { name, website, formatted_address, types, rating, user_ratings_total } = detailsData.result;
                
                logs.push(`Details retrieved. Website exists: ${Boolean(website)}`);
                
                // Only add businesses with websites
                if (website) {
                  // Try to fetch the website metadata for analysis
                  let websiteHtml = '';
                  try {
                    const websiteResponse = await fetch(website, { 
                      headers: { 'User-Agent': 'Mozilla/5.0 Google Maps Scanner' },
                      signal: AbortSignal.timeout(5000) // 5 second timeout
                    });
                    
                    if (websiteResponse.ok) {
                      const contentType = websiteResponse.headers.get('content-type');
                      
                      if (contentType && contentType.includes('text/html')) {
                        websiteHtml = await websiteResponse.text();
                        
                        // Store a short sample of the HTML to help with debugging
                        if (websiteHtml.length > 0) {
                          htmlSamples.push({
                            url: website,
                            length: websiteHtml.length,
                            sample: websiteHtml.substring(0, 200) + '...'
                          });
                        }
                      }
                    }
                  } catch (websiteError) {
                    logs.push(`Error fetching website ${website}: ${websiteError.message}`);
                  }
                  
                  businesses.push({
                    name,
                    website: website.replace(/^https?:\/\//, ''),
                    formatted_address,
                    location: formatted_address,
                    place_id: place.place_id,
                    business_types: types || [],
                    rating: rating || 0,
                    rating_count: user_ratings_total || 0,
                    has_website: true
                  });
                  
                  logs.push(`Added business: ${name}`);
                }
              } else {
                logs.push(`Error in details response: ${detailsData.status}`);
              }
            } catch (detailsError) {
              logs.push(`Error fetching details for ${place.name}: ${detailsError.message}`);
            }
          }
        }
      }
      
      logs.push(`Found ${businesses.length} businesses with websites`);
      
      // Create debug info object to return with the response
      const debugInfo: ScanDebugInfo = {
        logs,
        htmlSamples: htmlSamples.length > 0 ? htmlSamples : undefined
      };
      
      return new Response(JSON.stringify({ 
        businesses,
        status: 'OK',
        test_mode: false,
        debugInfo
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      console.error('Error fetching from Google Maps API:', fetchError);
      
      return new Response(JSON.stringify({ 
        error: 'Google Maps API fetch error',
        message: fetchError.message || 'Failed to connect to Google Maps API',
        details: 'This could be due to network issues, invalid API key format, or billing issues with your Google Cloud account',
        test_mode: true,
        businesses: []
      }), {
        status: 200, // Return 200 to prevent edge function error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in Google Maps search:', error);
    
    // Return a 200 status to prevent edge function error
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      message: 'There was a problem processing your request',
      test_mode: true,
      businesses: [],
    }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
