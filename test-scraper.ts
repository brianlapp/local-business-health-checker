// Test script for web scraper with specific location

const testLocation = "Carleton Place, Ontario, Canada";
const API_URL = "http://localhost:54321/functions/v1/web-scraper";

async function testScraper() {
  console.log(`Testing web scraper for location: ${testLocation}`);
  console.log('---------------------------------------------------');
  
  try {
    // Test with auto mode (all sources)
    console.log('\nTesting AUTO mode (all sources):\n');
    await runTest('auto');
    
    // Test with yellowpages source
    console.log('\nTesting YELLOWPAGES source:\n');
    await runTest('yellowpages');
    
    // Test with localstack source
    console.log('\nTesting LOCALSTACK source:\n');
    await runTest('localstack');
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function runTest(source: string) {
  console.log(`Running test with source: ${source}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: testLocation,
        source: source
      })
    });
    
    const duration = Date.now() - startTime;
    console.log(`Response status: ${response.status} (${duration}ms)`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    
    // Print summary of results
    console.log(`Found ${data.count} businesses`);
    console.log(`Source: ${data.source}`);
    
    // Print detailed stats if available
    if (data.stats) {
      console.log('\nStats:');
      console.log(`- Total businesses: ${data.stats.total}`);
      console.log(`- Unique businesses: ${data.stats.unique}`);
      
      if (data.stats.sources) {
        console.log('\nSource details:');
        
        if (data.stats.sources.yellowpages) {
          const yp = data.stats.sources.yellowpages;
          console.log(`- YellowPages: ${yp.count} businesses, success: ${yp.success}, duration: ${yp.duration}`);
          if (yp.error) console.log(`  Error: ${yp.error}`);
        }
        
        if (data.stats.sources.localstack) {
          const ls = data.stats.sources.localstack;
          console.log(`- LocalStack: ${ls.count} businesses, success: ${ls.success}, duration: ${ls.duration}`);
          if (ls.error) console.log(`  Error: ${ls.error}`);
        }
        
        if (data.stats.sources.mock && data.stats.sources.mock.used) {
          console.log(`- Mock data used: ${data.stats.sources.mock.count} businesses`);
        }
      }
    }
    
    // Print first 3 businesses as sample
    if (data.businesses && data.businesses.length > 0) {
      console.log('\nSample businesses:');
      data.businesses.slice(0, 3).forEach((business: any, index: number) => {
        console.log(`${index + 1}. ${business.name} - ${business.website} (source: ${business.source})`);
      });
    } else {
      console.log('No businesses found');
    }
    
  } catch (error) {
    console.error(`Test error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Run the test
testScraper();
