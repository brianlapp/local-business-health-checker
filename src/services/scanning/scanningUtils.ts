
import { toast } from 'sonner';
import { Business, BusinessScanResponse, ScanDebugInfo } from '@/types/business';
import { generateMockBusinessData } from '../businessProcessingService';

/**
 * Handles errors and returns mock data as fallback
 */
export function handleScanError(
  error: any, 
  location: string | number
): BusinessScanResponse {
  console.error('Scan error:', error);
  
  toast.error(`Error: ${error.message || 'Failed to search for businesses'}`);
  
  // Convert location to string to ensure type compatibility
  const locationString = String(location);
  
  // Generate mock businesses with correct argument count
  const mockBusinesses = generateMockBusinessData(locationString);
  
  // Return mock data as a fallback with proper BusinessScanResponse type
  return {
    businesses: mockBusinesses,
    count: mockBusinesses.length,
    location: locationString,
    source: 'error-fallback',
    timestamp: new Date().toISOString(),
    test_mode: true,
    error: error.message || 'Failed to search for businesses',
    message: 'Using sample data due to an error with the business search API',
    debugInfo: {
      errors: [error.message || 'Unknown error'],
      warnings: ['Using fallback data'],
      logs: ['Error occurred, using mock data'],
      htmlSamples: []
    }
  };
}

/**
 * Extracts clean business data from HTML
 * (Placeholder for a future implementation)
 */
export function extractBusinessFromHtml(
  html: string, 
  selectors: {
    container: string,
    name: string,
    website: string,
    phone?: string
  }
): Business[] {
  // This function would use DOM parsing to extract business information
  // For now, it's just a placeholder for future implementation
  console.log(`HTML extraction not yet implemented - received ${html.length} bytes`);
  return [];
}

/**
 * Formats a business website URL consistently
 */
export function normalizeWebsiteUrl(url: string): string {
  if (!url) return '';
  
  // Remove protocol
  let normalized = url.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  
  // Remove www. prefix
  normalized = normalized.replace(/^www\./, '');
  
  return normalized.toLowerCase();
}

/**
 * Generates a debug info object with current scan details
 */
export function createDebugInfo(details: Partial<ScanDebugInfo> = {}): ScanDebugInfo {
  return {
    processingTime: Date.now(),
    errors: [],
    warnings: [],
    logs: [],
    htmlSamples: [],
    ...details
  };
}

/**
 * Determines if a business is an agency based on its name and website content
 */
export function isLikelyAgency(business: Business): boolean {
  if (!business.name) return false;
  
  const agencyKeywords = [
    'agency', 'digital', 'marketing', 'web', 'design', 'media', 
    'creative', 'studios', 'consulting', 'solutions', 'development',
    'tech', 'software', 'systems', 'IT', 'technology', 'interactive'
  ];
  
  const lowerName = business.name.toLowerCase();
  return agencyKeywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
}

/**
 * Calculates a score for how much an agency specializes in web development
 * Higher score = more likely to be a web development focused agency
 */
export function calculateAgencyWebDevScore(business: Business): number {
  if (!business.name) return 0;
  
  const webDevKeywords = [
    'web', 'development', 'design', 'frontend', 'backend', 
    'fullstack', 'react', 'angular', 'vue', 'node', 'developer'
  ];
  
  // Count how many web dev keywords appear in the name
  const lowerName = business.name.toLowerCase();
  const matchCount = webDevKeywords.filter(keyword => 
    lowerName.includes(keyword.toLowerCase())
  ).length;
  
  // Calculate a score from 0-100
  return Math.min(matchCount * 20, 100);
}
