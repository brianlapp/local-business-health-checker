
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
    const requestData = await req.json();
    console.log("Request data received:", JSON.stringify(requestData));
    
    // Accept either url or website parameter for better compatibility
    const url = requestData.url || requestData.website;
    const businessId = requestData.businessId;
    
    if (!url) {
      console.error("No URL provided in request");
      throw new Error('URL parameter is required');
    }
    
    // Clean and validate the URL
    let domain = url.toLowerCase().trim();
    try {
      // Handle URLs with or without protocol
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
      // Remove 'www.' if present
      domain = domain.replace(/^www\./, '');
      
      console.log(`Cleaned domain for BuiltWith scan: ${domain}`);
    } catch (e) {
      console.error(`URL parsing error: ${e.message}`);
      throw new Error(`Invalid URL format: ${url}`);
    }

    console.log(`Scanning technology stack for: ${domain}`);
    
    if (!BUILTWITH_API_KEY) {
      throw new Error('BUILTWITH_API_KEY environment variable is not set');
    }
    
    const apiUrl = new URL('https://api.builtwith.com/free1/api.json');
    apiUrl.searchParams.append('KEY', BUILTWITH_API_KEY);
    apiUrl.searchParams.append('LOOKUP', domain);
    
    console.log(`Making request to BuiltWith API for: ${domain}`);
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`BuiltWith API error: ${response.status} - ${errorText}`);
      throw new Error(`BuiltWith API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`BuiltWith API response received for ${domain}`);
    
    // Extract CMS and other relevant technologies
    let cms = 'Unknown';
    let isMobileFriendly = false;
    const technologies = [];
    
    if (data.Results && data.Results.length > 0) {
      const techs = data.Results[0].Technologies || [];
      
      techs.forEach(tech => {
        technologies.push({
          name: tech.Name,
          category: tech.Category
        });
        
        // Look for CMS in multiple categories
        if (
          tech.Category === 'CMS' || 
          tech.Category === 'Ecommerce' ||
          tech.Name.toLowerCase().includes('wordpress') ||
          tech.Name.toLowerCase().includes('wix') ||
          tech.Name.toLowerCase().includes('squarespace')
        ) {
          cms = tech.Name;
        }
        
        // Check for mobile-friendly technologies
        if (
          tech.Category === 'Mobile' ||
          tech.Name.toLowerCase().includes('responsive') ||
          tech.Name.toLowerCase().includes('mobile') ||
          tech.Name.toLowerCase().includes('bootstrap') ||
          tech.Name.toLowerCase().includes('foundation')
        ) {
          isMobileFriendly = true;
        }
      });
    }
    
    const result = {
      cms,
      technologies,
      domain,
      isMobileFriendly,
      analyzedAt: new Date().toISOString()
    };
    
    console.log(`Technology scan complete for ${domain}, CMS identified: ${cms}, Mobile friendly: ${isMobileFriendly}`);
    
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
