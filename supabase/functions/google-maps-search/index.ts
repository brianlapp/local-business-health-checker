
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

    console.log(`Searching for businesses in: "${location}" within ${radius}km radius`);
    
    // Use a more precise query format to get better results
    // Adding "businesses in" helps Google Maps understand we're looking for businesses
    const searchQuery = `businesses in ${location}`;
    
    // Construct the URL for the Google Places API text search
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', searchQuery);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY!);
    url.searchParams.append('radius', (radius * 1000).toString()); // Convert km to meters
    
    console.log(`Sending request to Google Maps API with query: "${searchQuery}"`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Maps API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log the actual API response for debugging
    console.log(`Google Maps API response status: ${data.status}`);
    console.log(`Found ${data.results?.length || 0} businesses`);
    
    if (data.error_message) {
      console.error(`Google Maps API error: ${data.error_message}`);
      throw new Error(data.error_message);
    }
    
    // If there are no results, try a more general search
    if (!data.results || data.results.length === 0) {
      console.log(`No results found for "${searchQuery}". Trying more general search...`);
      
      // Trying a more general search without "businesses in"
      const generalUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      generalUrl.searchParams.append('query', location);
      generalUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY!);
      generalUrl.searchParams.append('radius', (radius * 1000).toString());
      
      const generalResponse = await fetch(generalUrl.toString());
      const generalData = await generalResponse.json();
      
      console.log(`General search found ${generalData.results?.length || 0} results`);
      
      // Use these results if available
      if (generalData.results && generalData.results.length > 0) {
        data.results = generalData.results;
      }
    }
    
    // Process the results to extract businesses with their details
    const businesses = data.results?.map(place => {
      console.log(`Processing business: ${place.name}, website: ${place.website || 'N/A'}`);
      return {
        name: place.name,
        formatted_address: place.formatted_address,
        place_id: place.place_id,
        website: place.website || null
      };
    }) || [];
    
    console.log(`Returning ${businesses.length} businesses`);
    
    return new Response(JSON.stringify({ businesses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Google Maps search:', error);
    
    return new Response(JSON.stringify({ error: error.message, businesses: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
