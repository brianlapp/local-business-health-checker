
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get the Mapbox token from environment variables
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN');
    
    if (!MAPBOX_TOKEN) {
      console.error('MAPBOX_TOKEN is not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse the request to get style information
    const { style } = await req.json();
    
    // Default to streets style if none specified
    const mapStyle = style || 'streets-v12';
    
    // Return the token and requested style
    return new Response(
      JSON.stringify({ 
        token: MAPBOX_TOKEN,
        styleUrl: `mapbox://styles/mapbox/${mapStyle}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in mapbox-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
