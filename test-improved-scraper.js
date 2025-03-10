// Test script for the improved web scraper
const fetch = require('node-fetch');

// Location to test
const location = 'Carleton Place, Ontario, Canada';

// Function to test the web scraper
async function testWebScraper() {
  console.log(`Testing improved web scraper for location: ${location}`);
  console.log('=======================================================');
  
  try {
    // Call the web scraper function endpoint
    const response = await fetch('https://lovable.dev/functions/web-scraper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Display the results
    console.log('\nScraping Results:');
    console.log('=======================================================');
    console.log(`Total businesses found: ${data.businesses.length}`);
    console.log(`Sources: ${Object.keys(data.stats.sourceStats).join(', ')}`);
    
    // Show stats for each source
    console.log('\nSource Statistics:');
    for (const [source, stats] of Object.entries(data.stats.sourceStats)) {
      console.log(`- ${source}: ${stats.count} businesses, Duration: ${stats.duration}ms`);
    }
    
    // Show sample businesses
    console.log('\nSample Businesses:');
    const sampleSize = Math.min(5, data.businesses.length);
    for (let i = 0; i < sampleSize; i++) {
      const business = data.businesses[i];
      console.log(`${i+1}. ${business.name} - ${business.website}${business.phone ? ' (' + business.phone + ')' : ''}`);
    }
    
    console.log('=======================================================');
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing web scraper:', error);
  }
}

// Run the test
testWebScraper();
