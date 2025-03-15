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
