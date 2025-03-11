
import { toast } from 'sonner';
import { Business, BusinessScanResponse } from '@/types/business';
import { generateMockBusinessData } from '../businessProcessingService';

/**
 * Handles errors and returns mock data as fallback
 */
export function handleScanError(
  error: any, 
  location: string, 
  toastId?: string
): BusinessScanResponse {
  console.error('Scan error:', error);
  
  if (toastId) {
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`, {
      id: toastId
    });
  } else {
    toast.error(`Error: ${error.message || 'Failed to search for businesses'}`);
  }
  
  // Generate mock data synchronously to avoid Promise issues
  const mockBusinesses = generateMockBusinessData(String(location), 'error-fallback');
  
  // Return mock data as a fallback with proper BusinessScanResponse type
  return {
    businesses: mockBusinesses,
    count: mockBusinesses.length,
    location,
    source: 'error-fallback',
    timestamp: new Date().toISOString(),
    test_mode: true,
    error: error.message || 'Failed to search for businesses',
    message: 'Using sample data due to an error with the business search API'
  };
}
