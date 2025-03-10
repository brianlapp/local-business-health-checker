// Enhanced Node.js script to test web scraping for Carleton Place, Ontario, Canada
import https from 'node:https';
import http from 'node:http';
import { createServer } from 'node:http';

// Configuration
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';
const API_PORT = 54321;  // Default Supabase Functions port
const API_PATH = '/functions/v1/web-scraper';

// Format location
const cleanLocation = TEST_LOCATION.replace(/\s+/g, ' ').trim();
const encodedLocation = encodeURIComponent(cleanLocation);

// Browser-like headers to avoid being blocked
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.google.com/',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'cross-site',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Pragma': 'no-cache'
};

// URLs to test
const urls = [
  `https://www.yellowpages.com/search?search_terms=businesses&geo_location_terms=${encodedLocation}`,
  `https://www.yellowpages.com/${encodeURIComponent(cleanLocation.toLowerCase().replace(/[,\s]+/g, '-'))}/businesses`,
  `https://localstack.com/search?q=${encodedLocation}&type=businesses`
];

// Function to make HTTP request and check response
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(`Testing URL: ${url}`);
    
    const request = https.get(url, { headers }, (response) => {
      const statusCode = response.statusCode;
      console.log(`Status code: ${statusCode}`);
      
      if (statusCode !== 200) {
        console.log(`Failed with status: ${statusCode}`);
        resolve({
          success: false,
          url,
          statusCode
        });
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        console.log(`Received ${data.length} bytes of data`);
        
        // Check if the response contains business listings
        const hasBusinessData = 
          data.includes('business-name') || 
          data.includes('class="result"') || 
          data.includes('organic') ||
          data.includes('<div class="listing"') ||
          data.includes('business-listing') ||
          data.includes('company-card');
        
        console.log(`Contains business data: ${hasBusinessData}`);
        
        // Extract a sample of business names using regex
        const businessNameRegex = /<h\d[^>]*>(.*?)<\/h\d>/gi;
        const businessNames = [];
        let match;
        let count = 0;
        
        while ((match = businessNameRegex.exec(data)) !== null && count < 5) {
          businessNames.push(match[1].replace(/<[^>]*>/g, '').trim());
          count++;
        }
        
        if (businessNames.length > 0) {
          console.log('Sample business names found:');
          businessNames.forEach(name => console.log(`- ${name}`));
        } else {
          console.log('No business names found with regex');
        }
        
        resolve({
          success: true,
          url,
          statusCode,
          dataLength: data.length,
          hasBusinessData,
          sampleBusinessNames: businessNames
        });
      });
    });
    
    request.on('error', (error) => {
      console.error(`Error making request to ${url}:`, error.message);
      reject(error);
    });
    
    // Set a timeout
    request.setTimeout(10000, () => {
      request.destroy();
      console.log(`Request to ${url} timed out`);
      resolve({
        success: false,
        url,
        error: 'Timeout'
      });
    });
  });
}

// Test all URLs
async function testAllUrls() {
  console.log(`Testing web scraping for: ${location}`);
  console.log('-----------------------------------');
  
  for (const url of urls) {
    try {
      const result = await makeRequest(url);
      console.log('-----------------------------------');
    } catch (error) {
      console.error('Request failed:', error.message);
      console.log('-----------------------------------');
    }
  }
}

// Run the tests
testAllUrls();
