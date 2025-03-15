
import { BusinessData } from "./types.ts";
import { debugLog } from "./scraper-utils.ts";

/**
 * Generate mock business data based on location
 */
export function getMockBusinessData(location: string): BusinessData[] {
  debugLog(`Generating mock data for location: ${location}`);
  
  // Extract city name from location
  const locationParts = location.split(',').map(part => part.trim());
  const cityName = locationParts[0] || location;
  
  // Business categories common in small to medium cities
  const businessTypes = [
    'Restaurant', 'Cafe', 'Hardware Store', 'Bakery', 'Auto Repair',
    'Dental Clinic', 'Hair Salon', 'Fitness Center', 'Grocery Store',
    'Pharmacy', 'Clothing Store', 'Pet Store', 'Bookstore', 'Law Firm'
  ];
  
  // Generate 10 businesses
  const mockBusinesses: BusinessData[] = [];
  
  for (let i = 0; i < 10; i++) {
    // Select a business type
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    
    // Generate business name variations
    const name = `${cityName} ${businessType}`;
    
    // Generate a website based on the name
    const website = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    
    mockBusinesses.push({
      name,
      website,
      source: 'mock'
    });
  }
  
  debugLog(`Generated ${mockBusinesses.length} mock businesses for ${location}`);
  return mockBusinesses;
}
