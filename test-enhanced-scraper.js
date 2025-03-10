// Enhanced Node.js script to test our improved web scraper for Carleton Place, Ontario, Canada
import http from 'node:http';

// Configuration
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';
const API_PORT = 54321;  // Default Supabase Functions port
const API_PATH = '/functions/v1/web-scraper';

// Test different modes with our enhanced web scraper
const TEST_MODES = [
  { name: 'Auto (all sources)', source: 'auto' },
  { name: 'YellowPages only', source: 'yellowpages' },
  { name: 'LocalStack only', source: 'localstack' }
];

// Function to make a request to our local web scraper API
function testWebScraper(source) {
  return new Promise((resolve, reject) => {
    console.log(`\n\n=== Testing web scraper with source: ${source} ===`);
    
    const requestData = JSON.stringify({
      location: TEST_LOCATION,
      source: source
    });
    
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      const statusCode = res.statusCode;
      const duration = Date.now() - startTime;
      
      console.log(`Response status: ${statusCode} (${duration}ms)`);
      
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (statusCode !== 200) {
          console.log(`Error response: ${responseData}`);
          resolve({
            success: false,
            source,
            statusCode,
            error: responseData,
            duration
          });
          return;
        }
        
        try {
          const parsedData = JSON.parse(responseData);
          
          // Print summary of results
          console.log(`Found ${parsedData.count} businesses`);
          console.log(`Source: ${parsedData.source}`);
          
          // Print detailed stats if available
          if (parsedData.stats) {
            console.log('\nStats:');
            console.log(`- Total businesses: ${parsedData.stats.total}`);
            console.log(`- Unique businesses: ${parsedData.stats.unique}`);
            
            if (parsedData.stats.sources) {
              console.log('\nSource details:');
              
              if (parsedData.stats.sources.yellowpages) {
                const yp = parsedData.stats.sources.yellowpages;
                console.log(`- YellowPages: ${yp.count} businesses, success: ${yp.success}, duration: ${yp.duration}`);
                if (yp.error) console.log(`  Error: ${yp.error}`);
              }
              
              if (parsedData.stats.sources.localstack) {
                const ls = parsedData.stats.sources.localstack;
                console.log(`- LocalStack: ${ls.count} businesses, success: ${ls.success}, duration: ${ls.duration}`);
                if (ls.error) console.log(`  Error: ${ls.error}`);
              }
              
              if (parsedData.stats.sources.mock && parsedData.stats.sources.mock.used) {
                console.log(`- Mock data used: ${parsedData.stats.sources.mock.count} businesses`);
              }
            }
          }
          
          // Print first 3 businesses as sample
          if (parsedData.businesses && parsedData.businesses.length > 0) {
            console.log('\nSample businesses:');
            parsedData.businesses.slice(0, 3).forEach((business, index) => {
              console.log(`${index + 1}. ${business.name} - ${business.website} (source: ${business.source})`);
            });
          } else {
            console.log('No businesses found');
          }
          
          resolve({
            success: true,
            source,
            statusCode,
            data: parsedData,
            duration
          });
        } catch (error) {
          console.error('Error parsing response:', error);
          resolve({
            success: false,
            source,
            statusCode,
            error: error.message,
            duration
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error making request: ${error.message}`);
      resolve({
        success: false,
        source,
        error: error.message
      });
    });
    
    req.write(requestData);
    req.end();
  });
}

// Check if the Supabase Functions server is running
function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: API_PORT,
      path: '/',
      method: 'GET'
    }, (res) => {
      resolve(res.statusCode < 500); // Consider any non-500 response as server running
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log(`Testing web scraper for location: ${TEST_LOCATION}`);
  console.log('=======================================================');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.error('\n❌ ERROR: Supabase Functions server is not running!');
    console.log('Please start the server with: supabase functions serve --no-verify-jwt');
    console.log('Then run this test script again.');
    process.exit(1);
  }
  
  console.log('✅ Supabase Functions server is running');
  
  // Run tests for each mode
  for (const mode of TEST_MODES) {
    try {
      await testWebScraper(mode.source);
    } catch (error) {
      console.error(`Error testing ${mode.name}:`, error);
    }
  }
  
  console.log('\n=======================================================');
  console.log('All tests completed!');
}

// Run the tests
runAllTests();
