// Direct test script for the enhanced web scraper
import { scrapeYellowPages, scrapeLocalStack } from './supabase/functions/web-scraper/index.ts';

// Configuration
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';

// Function to test a scraper and report results
async function testScraper(name, scraperFn) {
  console.log(`\n=== Testing ${name} scraper with location: ${TEST_LOCATION} ===\n`);
  
  const startTime = Date.now();
  let results = [];
  let error = null;
  
  try {
    results = await scraperFn(TEST_LOCATION);
  } catch (err) {
    error = err;
  }
  
  const duration = Date.now() - startTime;
  
  console.log(`Duration: ${duration}ms`);
  
  if (error) {
    console.error(`Error: ${error.message}`);
    return {
      success: false,
      source: name,
      error: error.message,
      duration
    };
  }
  
  console.log(`Found ${results.length} businesses`);
  
  // Print first 5 businesses as sample
  if (results.length > 0) {
    console.log('\nSample businesses:');
    results.slice(0, 5).forEach((business, index) => {
      console.log(`${index + 1}. ${business.name || 'Unnamed'} - ${business.website || 'No website'} (${business.phone || 'No phone'})`);
    });
  }
  
  return {
    success: true,
    source: name,
    count: results.length,
    duration
  };
}

// Run all tests
async function runAllTests() {
  console.log(`Testing enhanced web scraper for location: ${TEST_LOCATION}`);
  console.log('=======================================================');
  
  // Test YellowPages scraper
  const ypResults = await testScraper('YellowPages', scrapeYellowPages);
  
  // Test LocalStack scraper
  const lsResults = await testScraper('LocalStack', scrapeLocalStack);
  
  // Summary
  console.log('\n=======================================================');
  console.log('Test Summary:');
  console.log(`- YellowPages: ${ypResults.success ? `Success (${ypResults.count} businesses)` : `Failed: ${ypResults.error}`}`);
  console.log(`- LocalStack: ${lsResults.success ? `Success (${lsResults.count} businesses)` : `Failed: ${lsResults.error}`}`);
  console.log('=======================================================');
}

// Run the tests
runAllTests();
