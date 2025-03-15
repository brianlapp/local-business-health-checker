
// Simple test script to simulate a request to our web scraper

// Mock request object
const mockRequest = {
  method: 'POST',
  json: async () => ({
    location: 'Carleton Place, Ontario, Canada',
    source: 'auto',
    debug: true
  })
};

// Import the serve function from our index.ts
import { serve } from './index.ts';

// Call the serve function with our mock request
const response = await serve(mockRequest);

// Log the response
const responseBody = await response.json();
console.log(JSON.stringify(responseBody, null, 2));
