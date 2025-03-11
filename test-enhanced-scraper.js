
// Enhanced test script for the web scraper function

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Configure Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test location for Canada
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';
const TEST_SOURCE = process.argv[2] || 'yellowpages'; // Default to yellowpages, but allow override

console.log(`Testing web-scraper with location: "${TEST_LOCATION}" using source: "${TEST_SOURCE}"`);
console.log('This may take a minute or two depending on the scraper...');

// Call the web-scraper edge function
async function runTest() {
  console.time('Total scrape time');
  
  try {
    const { data, error } = await supabase.functions.invoke('web-scraper', {
      body: { 
        location: TEST_LOCATION,
        source: TEST_SOURCE,
        debug: true // Enable debug mode
      },
    });
    
    console.timeEnd('Total scrape time');
    
    if (error) {
      console.error('Error invoking edge function:', error);
      return;
    }
    
    console.log('\n=== SCRAPER RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.businesses && data.businesses.length > 0) {
      console.log('\n=== FOUND BUSINESSES ===');
      console.log(`Total: ${data.businesses.length} businesses`);
      
      // Display first 5 businesses
      console.log('\nSample businesses:');
      const sample = data.businesses.slice(0, 5);
      sample.forEach((business, index) => {
        console.log(`\n#${index + 1} - ${business.name}`);
        console.log(`Website: ${business.website}`);
        if (business.phone) console.log(`Phone: ${business.phone}`);
        if (business.source) console.log(`Source: ${business.source}`);
      });
    } else {
      console.log('\nNo businesses found in the response.');
    }
    
    // Report on debug logs if present
    if (data.debug && data.debug.logs) {
      console.log('\n=== DEBUG LOGS ===');
      console.log(`${data.debug.logs.length} log entries captured`);
      
      if (data.debug.htmlSamples) {
        console.log(`\n${data.debug.htmlSamples.length} HTML samples captured`);
      }
    }
    
    // Report any errors
    if (data.error || (data.stats && (data.stats.sources.yellowpages.error || data.stats.sources.localstack.error))) {
      console.log('\n=== SCRAPER ERRORS ===');
      if (data.error) console.log(`Main error: ${data.error}`);
      if (data.stats && data.stats.sources.yellowpages.error) 
        console.log(`YellowPages error: ${data.stats.sources.yellowpages.error}`);
      if (data.stats && data.stats.sources.localstack.error) 
        console.log(`LocalStack error: ${data.stats.sources.localstack.error}`);
    }
    
  } catch (err) {
    console.timeEnd('Total scrape time');
    console.error('\nERROR CAUGHT DURING TEST:', err);
  }
}

runTest();
