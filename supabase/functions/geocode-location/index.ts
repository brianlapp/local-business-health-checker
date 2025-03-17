
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known Canadian city coordinates for fallback
const canadianCityCoordinates: Record<string, [number, number]> = {
  'toronto': [-79.347, 43.651],
  'vancouver': [-123.116, 49.283],
  'montreal': [-73.568, 45.501],
  'ottawa': [-75.695, 45.424],
  'calgary': [-114.066, 51.049],
  'edmonton': [-113.491, 53.546],
  'quebec': [-71.208, 46.813],
  'winnipeg': [-97.138, 49.895],
  'hamilton': [-79.866, 43.256],
  'victoria': [-123.370, 48.428],
  'halifax': [-63.573, 44.649],
  'saskatoon': [-106.670, 52.133],
  'regina': [-104.618, 50.448],
  'st. john\'s': [-52.712, 47.561],
  'london': [-81.243, 42.984],
  'oshawa': [-78.866, 43.897],
  'kitchener': [-80.483, 43.451],
  'barrie': [-79.690, 44.389],
  'kelowna': [-119.495, 49.887]
};

// Main function to handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the location from the request
    const { location } = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Geocoding location: ${location}`);
    
    // Try to use an external geocoding service if the API key is available
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');
    
    if (MAPBOX_TOKEN) {
      try {
        // Use Mapbox Geocoding API
        const encodedLocation = encodeURIComponent(location);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${MAPBOX_TOKEN}&country=ca&limit=1`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const placeName = data.features[0].place_name;
            
            return new Response(
              JSON.stringify({ 
                coordinates: [lng, lat],
                source: 'mapbox',
                formatted_location: placeName
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (e) {
        console.error('Error using Mapbox geocoding:', e);
        // Fall through to fallback
      }
    }
    
    // Fallback to our local database of Canadian cities
    const locationLower = location.toLowerCase();
    
    // Try to match the location to a known city
    const cityMatch = Object.keys(canadianCityCoordinates).find(city => 
      locationLower.includes(city.toLowerCase())
    );
    
    if (cityMatch) {
      console.log(`Found match for ${location}: ${cityMatch}`);
      return new Response(
        JSON.stringify({ 
          coordinates: canadianCityCoordinates[cityMatch],
          source: 'local-database',
          formatted_location: cityMatch.charAt(0).toUpperCase() + cityMatch.slice(1) + ', Canada'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Default to Toronto if no match found
    console.log(`No match found for ${location}, defaulting to Toronto`);
    return new Response(
      JSON.stringify({ 
        coordinates: canadianCityCoordinates['toronto'],
        source: 'default',
        formatted_location: 'Toronto, Canada'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geocode-location:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during geocoding' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
