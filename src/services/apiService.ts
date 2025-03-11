
// This file serves as a facade to the underlying specialized services
// It re-exports functions from the specialized services to maintain backward compatibility

import { scanBusinessesInArea } from './scanningService';
import { addBusiness, getBusinesses } from './businessCrudService';
import { generateIssues, isCMSOutdated, isWebsiteSecure } from './businessUtilsService';

// Re-export everything
export {
  scanBusinessesInArea,
  addBusiness,
  getBusinesses,
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
};

// Re-export types for compatibility
export interface AddBusinessPayload {
  name: string;
  website: string;
}
