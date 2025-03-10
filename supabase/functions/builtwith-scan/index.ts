
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BUILTWITH_API_KEY = Deno.env.get('BUILTWITH_API_KEY');

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
    const { website } = await req.json();
    
    if (!website) {
      throw new Error('Website parameter is required');
    }

    // Extract domain from the website URL
    let domain = website;
    try {
      const url = new URL(website);
      domain = url.hostname;
    } catch (e) {
      console.warn(`Could not parse URL: ${website}, using as-is`);
    }

    console.log(`Scanning technology stack for: ${domain}`);
    
    const url = new URL('https://api.builtwith.com/free1/api.json');
    url.searchParams.append('KEY', BUILTWITH_API_KEY!);
    url.searchParams.append('LOOKUP', domain);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BuiltWith API error: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract CMS and other relevant technologies
    let cms = 'Unknown';
    const technologies = [];
    
    if (data.Results && data.Results.length > 0) {
      const techs = data.Results[0].Technologies || [];
      
      techs.forEach(tech => {
        technologies.push({
          name: tech.Name,
          category: tech.Category
        });
        
        if (tech.Category === 'CMS' || tech.Category === 'Ecommerce') {
          cms = tech.Name;
        }
      });
    }
    
    const result = {
      cms,
      technologies,
      domain,
      analyzedAt: new Date().toISOString()
    };
    
    console.log(`Technology scan complete, CMS identified: ${cms}`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in BuiltWith scan:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
