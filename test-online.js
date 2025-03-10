// Script to test the enhanced web scraper using the online test environment
import https from 'node:https';

// Configuration
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';
const API_URL = 'https://local-business-health-checker-brianlapp.vercel.app/api/scrape';

// Function to make a request to the online API
function testOnlineScraper() {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Testing online web scraper with location: ${TEST_LOCATION} ===\n`);
    
    const requestData = JSON.stringify({
      location: TEST_LOCATION
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    const startTime = Date.now();
    
    const req = https.request(API_URL, options, (res) => {
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
            statusCode,
            error: responseData,
            duration
          });
          return;
        }
        
        try {
          const parsedData = JSON.parse(responseData);
          
          // Print summary of results
          if (parsedData.businesses) {
            console.log(`Found ${parsedData.businesses.length} businesses`);
          } else {
            console.log('No businesses found in response');
          }
          
          // Print first 5 businesses as sample
          if (parsedData.businesses && parsedData.businesses.length > 0) {
            console.log('\nSample businesses:');
            parsedData.businesses.slice(0, 5).forEach((business, index) => {
              console.log(`${index + 1}. ${business.name || 'Unnamed'} - ${business.website || 'No website'} (${business.phone || 'No phone'})`);
            });
          }
          
          resolve({
            success: true,
            statusCode,
            data: parsedData,
            duration
          });
        } catch (error) {
          console.error('Error parsing response:', error);
          resolve({
            success: false,
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
        error: error.message
      });
    });
    
    req.write(requestData);
    req.end();
  });
}

// Run the test
async function runTest() {
  console.log(`Testing online web scraper for location: ${TEST_LOCATION}`);
  console.log('=======================================================');
  
  try {
    await testOnlineScraper();
  } catch (error) {
    console.error('Error during test:', error);
  }
  
  console.log('\n=======================================================');
  console.log('Test completed!');
}

// Run the test
runTest();
