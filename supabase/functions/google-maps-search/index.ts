
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
    const { location, radius } = await req.json();
    
    if (!location) {
      throw new Error('Location parameter is required');
    }

    console.log(`Searching for businesses matching: ${location} within ${radius}km radius`);
    
    // Construct a search query including both the location and business types
    const searchQuery = `businesses in ${location}`;
    
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', searchQuery);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY!);
    url.searchParams.append('radius', (radius * 1000).toString()); // Convert km to meters for Google API
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    console.log(`Found ${data.results?.length || 0} businesses`);
    
    // Process the results to extract businesses with their details
    const businesses = data.results?.map(place => ({
      name: place.name,
      formatted_address: place.formatted_address,
      place_id: place.place_id,
      website: place.website || null
    })) || [];
    
    return new Response(JSON.stringify({ businesses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Google Maps search:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
