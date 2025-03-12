
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
    const { url, businessId } = await req.json();
    
    if (!url) {
      throw new Error('Website parameter is required');
    }

    // Extract domain from the website URL
    let domain = url;
    try {
      // Handle URLs with or without protocol
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
    } catch (e) {
      console.warn(`Could not parse URL: ${url}, using as-is`);
    }

    console.log(`Scanning technology stack for: ${domain}`);
    
    if (!BUILTWITH_API_KEY) {
      throw new Error('BUILTWITH_API_KEY environment variable is not set');
    }
    
    const apiUrl = new URL('https://api.builtwith.com/free1/api.json');
    apiUrl.searchParams.append('KEY', BUILTWITH_API_KEY);
    apiUrl.searchParams.append('LOOKUP', domain);
    
    const response = await fetch(apiUrl.toString());
    
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
