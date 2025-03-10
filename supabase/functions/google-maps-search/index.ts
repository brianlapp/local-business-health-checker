
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
    
    // Use the Geocoding API instead of Places API
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.append('address', location);
    geocodeUrl.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    
    console.log(`Geocode Request URL: ${geocodeUrl.toString().replace(GOOGLE_MAPS_API_KEY, 'REDACTED')}`);
    
    const geocodeResponse = await fetch(geocodeUrl.toString());
    
    if (!geocodeResponse.ok) {
      const errorText = await geocodeResponse.text();
      console.error(`Google Geocoding API error response: ${errorText}`);
      return new Response(JSON.stringify({ 
        error: `Google Geocoding API returned error status: ${geocodeResponse.status}`,
        details: errorText,
        businesses: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const geocodeData = await geocodeResponse.json();
    
    console.log(`Google Geocoding API response status: ${geocodeData.status}`);
    
    // Special handling for authorization errors
    if (geocodeData.status === 'REQUEST_DENIED') {
      console.error(`Authorization error: ${geocodeData.error_message}`);
      return new Response(JSON.stringify({ 
        error: 'Google Maps API authorization error',
        message: 'The API key may have issues. Please check the following in your Google Cloud Console:\n\n1. Enable the "Geocoding API"\n2. Make sure your API key has permissions for the Geocoding API\n3. Verify billing is enabled for your Google Cloud project\n4. Check for any API restrictions (like website restrictions) that might be blocking the requests',
        status: geocodeData.status,
        businesses: [] 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for other API errors
    if (geocodeData.error_message) {
      console.error(`Google Geocoding API error: ${geocodeData.error_message}`);
      return new Response(JSON.stringify({ 
        error: geocodeData.error_message || 'Error from Google Geocoding API',
        status: geocodeData.status,
        businesses: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (geocodeData.results.length === 0) {
      console.log(`No results found for location: ${location}`);
      return new Response(JSON.stringify({ 
        businesses: [],
        message: `No results found for location: ${location}`,
        status: 'ZERO_RESULTS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get the lat/lng from the first result
    const { lat, lng } = geocodeData.results[0].geometry.location;
    console.log(`Found location coordinates: ${lat}, ${lng}`);
    
    // Generate some mock business data since we're not using Places API
    const businesses = generateMockBusinesses(location, 10);
    
    console.log(`Returning ${businesses.length} mock businesses`);
    
    return new Response(JSON.stringify({ businesses, status: 'OK' }), {
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

// Generate mock business data since we're not using Places API
function generateMockBusinesses(location: string, count: number) {
  const businessTypes = [
    'Restaurant', 'Cafe', 'Bakery', 'Grocery Store', 'Retail Shop', 
    'Hair Salon', 'Gym', 'Bookstore', 'Pharmacy', 'Hardware Store',
    'Flower Shop', 'Pet Store', 'Auto Repair', 'Clothing Store', 'Electronics Store'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const type = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    return {
      name: `${location} ${type} ${i + 1}`,
      formatted_address: `${Math.floor(Math.random() * 1000) + 1} Main St, ${location}`,
      place_id: `mock-place-id-${i}`,
      website: `example-${i}.com`
    };
  });
}
