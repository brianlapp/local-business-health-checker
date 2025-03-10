
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
    
    // Simplified query - directly use location for better results
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', location);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.append('radius', (radius * 1000).toString()); // Convert km to meters
    
    console.log(`Sending request to Google Maps API...`);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    console.log(`Google Maps API response status: ${data.status}`);
    
    // Check for API errors
    if (data.error_message) {
      console.error(`Google Maps API error: ${data.error_message}`);
      return new Response(JSON.stringify({ 
        error: data.error_message || 'Error from Google Maps API',
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
    
    return new Response(JSON.stringify({ businesses }), {
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
