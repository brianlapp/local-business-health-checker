// Standalone test script for the enhanced web scraper
// This script contains the core scraping logic directly to avoid TypeScript import issues

// Configuration
const TEST_LOCATION = 'Carleton Place, Ontario, Canada';

// Browser-like headers to avoid being blocked
function getBrowserLikeHeaders(customReferer) {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
  ];
  
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const isChrome = userAgent.includes('Chrome');
  
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': customReferer || 'https://www.google.com/',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Pragma': 'no-cache'
  };
  
  // Add Chrome-specific headers if using Chrome user agent
  if (isChrome) {
    headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = '"macOS"';
  }
  
  return headers;
}

// YellowPages scraper
async function scrapeYellowPages(location) {
  console.log(`Scraping YellowPages for location: ${location}`);
  
  const cleanLocation = location.replace(/\s+/g, ' ').trim();
  const encodedLocation = encodeURIComponent(cleanLocation);
  const slugLocation = cleanLocation.toLowerCase().replace(/[,\s]+/g, '-');
  
  // Different URL formats to try
  const urls = [
    `https://www.yellowpages.com/search?search_terms=businesses&geo_location_terms=${encodedLocation}`,
    `https://www.yellowpages.com/${encodeURIComponent(slugLocation)}/businesses`,
    `https://www.yellowpages.ca/search/si/1/${encodedLocation}/Businesses`
  ];
  
  let businesses = [];
  let success = false;
  let lastError = null;
  
  // Try each URL format with exponential backoff
  for (let i = 0; i < urls.length && !success; i++) {
    const url = urls[i];
    console.log(`Trying URL format ${i + 1}: ${url}`);
    
    // Try up to 3 times with exponential backoff
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const delay = attempt > 0 ? Math.pow(2, attempt) * 1000 : 0;
        if (delay > 0) {
          console.log(`Retrying after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await fetch(url, { headers: getBrowserLikeHeaders() });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`Received ${html.length} bytes of data`);
        
        // Extract business data using regex (simplified for this test)
        const businessNameRegex = /<h2[^>]*class="[^"]*business-name[^>]*>\s*<a[^>]*>([^<]+)<\/a>/gi;
        const phoneRegex = /<div[^>]*class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/div>/gi;
        const websiteRegex = /<a[^>]*class="[^"]*website[^"]*"[^>]*href="([^"]+)"[^>]*>/gi;
        
        let match;
        const tempBusinesses = [];
        
        // Extract business names
        while ((match = businessNameRegex.exec(html)) !== null) {
          tempBusinesses.push({
            name: match[1].trim(),
            phone: '',
            website: '',
            source: 'yellowpages'
          });
        }
        
        // Extract phone numbers
        let phoneIndex = 0;
        while ((match = phoneRegex.exec(html)) !== null && phoneIndex < tempBusinesses.length) {
          tempBusinesses[phoneIndex].phone = match[1].trim();
          phoneIndex++;
        }
        
        // Extract websites
        let websiteIndex = 0;
        while ((match = websiteRegex.exec(html)) !== null && websiteIndex < tempBusinesses.length) {
          tempBusinesses[websiteIndex].website = match[1].trim();
          websiteIndex++;
        }
        
        if (tempBusinesses.length > 0) {
          businesses = tempBusinesses;
          success = true;
          console.log(`Successfully extracted ${businesses.length} businesses from YellowPages`);
        } else {
          throw new Error('No businesses found in the response');
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
      }
    }
  }
  
  if (!success && lastError) {
    throw new Error(`All YellowPages scraping attempts failed: ${lastError.message}`);
  }
  
  return businesses;
}

// LocalStack scraper
async function scrapeLocalStack(location) {
  console.log(`Scraping LocalStack for location: ${location}`);
  
  const cleanLocation = location.replace(/\s+/g, ' ').trim();
  const encodedLocation = encodeURIComponent(cleanLocation);
  
  // Different URL formats to try
  const urls = [
    `https://localstack.com/search?q=${encodedLocation}&type=businesses`,
    `https://localstack.com/businesses/${encodedLocation.toLowerCase().replace(/[,\s]+/g, '-')}`,
    `https://localstack.com/api/search?q=${encodedLocation}&type=businesses`
  ];
  
  let businesses = [];
  let success = false;
  let lastError = null;
  
  // Try each URL format with exponential backoff
  for (let i = 0; i < urls.length && !success; i++) {
    const url = urls[i];
    console.log(`Trying URL format ${i + 1}: ${url}`);
    
    // Try up to 3 times with exponential backoff
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const delay = attempt > 0 ? Math.pow(2, attempt) * 1000 : 0;
        if (delay > 0) {
          console.log(`Retrying after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await fetch(url, { headers: getBrowserLikeHeaders() });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log(`Received ${html.length} bytes of data`);
        
        // Check if it's JSON (API response)
        if (url.includes('/api/')) {
          try {
            const data = JSON.parse(html);
            if (data.businesses && Array.isArray(data.businesses)) {
              businesses = data.businesses.map(b => ({
                name: b.name || '',
                phone: b.phone || '',
                website: b.website || '',
                source: 'localstack'
              }));
              success = true;
              console.log(`Successfully extracted ${businesses.length} businesses from LocalStack API`);
            }
          } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError.message);
          }
        } else {
          // Extract business data using regex (simplified for this test)
          const businessCardRegex = /<div[^>]*class="[^"]*company-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
          const businessNameRegex = /<h3[^>]*>([^<]+)<\/h3>/gi;
          const phoneRegex = /<span[^>]*class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/span>/gi;
          const websiteRegex = /<a[^>]*class="[^"]*website[^"]*"[^>]*href="([^"]+)"[^>]*>/gi;
          
          let match;
          const tempBusinesses = [];
          
          // Extract business cards
          while ((match = businessCardRegex.exec(html)) !== null) {
            const card = match[1];
            const nameMatch = /<h3[^>]*>([^<]+)<\/h3>/i.exec(card);
            const phoneMatch = /<span[^>]*class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card);
            const websiteMatch = /<a[^>]*href="([^"]+)"[^>]*>\s*website\s*<\/a>/i.exec(card);
            
            if (nameMatch) {
              tempBusinesses.push({
                name: nameMatch[1].trim(),
                phone: phoneMatch ? phoneMatch[1].trim() : '',
                website: websiteMatch ? websiteMatch[1].trim() : '',
                source: 'localstack'
              });
            }
          }
          
          if (tempBusinesses.length > 0) {
            businesses = tempBusinesses;
            success = true;
            console.log(`Successfully extracted ${businesses.length} businesses from LocalStack`);
          }
        }
        
        if (!success) {
          throw new Error('No businesses found in the response');
        }
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
      }
    }
  }
  
  if (!success && lastError) {
    throw new Error(`All LocalStack scraping attempts failed: ${lastError.message}`);
  }
  
  return businesses;
}

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
