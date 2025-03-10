
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
    
    // Validate API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not set');
      return new Response(JSON.stringify({ 
        error: 'Google Maps API key is not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { location, radius } = await req.json();
    
    if (!location) {
      return new Response(JSON.stringify({
        error: 'Location parameter is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Searching for businesses in: "${location}" within ${radius}km radius`);
    
    // Use the Places API for better business search
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.append('query', `businesses in ${location}`);
    searchUrl.searchParams.append('radius', (radius * 1000).toString()); // Convert km to meters
    searchUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    
    console.log(`Places API Request URL: ${searchUrl.toString().replace(GOOGLE_MAPS_API_KEY, 'REDACTED')}`);
    
    const searchResponse = await fetch(searchUrl.toString());
    const searchData = await searchResponse.json();
    
    console.log(`Google Maps API response status: ${searchData.status}`);
    
    // Handle API errors
    if (searchData.status === 'REQUEST_DENIED') {
      console.error(`Authorization error: ${searchData.error_message || 'This API project is not authorized to use this API.'}`);
      
      return new Response(JSON.stringify({ 
        error: 'Google Maps API authorization error',
        message: searchData.error_message || 'API key may have issues with authorization or billing',
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (searchData.status !== 'OK') {
      console.error(`Google Places API error: ${searchData.error_message || searchData.status}`);
      
      return new Response(JSON.stringify({
        error: `Google Maps API error: ${searchData.status}`,
        message: searchData.error_message || 'Failed to search for businesses',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Process the results to get business data
    const businesses = [];
    
    for (const place of searchData.results) {
      // If the place has a name, consider it a business
      if (place.name) {
        // Places API doesn't always return website URLs directly, get details for websites
        if (place.place_id) {
          const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
          detailsUrl.searchParams.append('place_id', place.place_id);
          detailsUrl.searchParams.append('fields', 'name,website,formatted_address');
          detailsUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
          
          try {
            const detailsResponse = await fetch(detailsUrl.toString());
            const detailsData = await detailsResponse.json();
            
            if (detailsData.status === 'OK' && detailsData.result) {
              const { name, website, formatted_address } = detailsData.result;
              
              // Only add businesses with websites
              if (website) {
                businesses.push({
                  name,
                  website: website.replace(/^https?:\/\//, ''),
                  formatted_address,
                  place_id: place.place_id
                });
              }
            }
          } catch (detailsError) {
            console.error(`Error fetching details for ${place.name}:`, detailsError);
          }
        }
      }
    }
    
    console.log(`Found ${businesses.length} businesses with websites`);
    
    return new Response(JSON.stringify({ 
      businesses,
      status: 'OK',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in Google Maps search:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
