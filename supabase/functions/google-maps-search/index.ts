
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
    // Validate API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not set');
      return new Response(JSON.stringify({ 
        error: 'Google Maps API key is not configured',
        businesses: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { location, radius } = await req.json();
    
    if (!location) {
      throw new Error('Location parameter is required');
    }

    console.log(`Searching for businesses in: "${location}" within ${radius}km radius`);
    console.log(`Using Google Maps API key: ${GOOGLE_MAPS_API_KEY.substring(0, 5)}...`);
    
    // Use the Places API text search endpoint
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', `businesses in ${location}`);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.append('radius', (radius * 1000).toString()); // Convert km to meters
    
    console.log(`Request URL: ${url.toString().replace(GOOGLE_MAPS_API_KEY, 'REDACTED')}`);
    
    const response = await fetch(url.toString());
    const status = response.status;
    console.log(`Google Maps API response status code: ${status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Maps API error response: ${errorText}`);
      return new Response(JSON.stringify({ 
        error: `Google Maps API returned error status: ${status}`,
        details: errorText,
        businesses: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    
    console.log(`Google Maps API response status: ${data.status}`);
    
    // Special handling for authorization errors
    if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('not authorized')) {
      console.error(`Authorization error: ${data.error_message}`);
      return new Response(JSON.stringify({ 
        error: 'Google Maps API authorization error',
        message: 'The provided API key is not authorized to use the Places API. Please make sure you have enabled the "Places API" (not just Maps JavaScript API) in your Google Cloud Console and are using an API key with Places API access.',
        status: data.status,
        businesses: [] 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for other API errors
    if (data.error_message) {
      console.error(`Google Maps API error: ${data.error_message}`);
      return new Response(JSON.stringify({ 
        error: data.error_message || 'Error from Google Maps API',
        status: data.status,
        businesses: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Process the results to extract businesses with their details
    const businesses = data.results?.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      place_id: place.place_id,
      website: place.website || null
    })) || [];
    
    console.log(`Returning ${businesses.length} businesses`);
    
    return new Response(JSON.stringify({ businesses, status: data.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Google Maps search:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred', 
      businesses: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
