
// This file serves as a facade to the underlying specialized business services
// It re-exports functions from the specialized services to maintain backward compatibility

import {
  getBusinesses,
  clearAllBusinesses,
  clearSelectedBusinesses,
  addBusiness,
  updateBusiness
} from './businessCrudService';

import {
  scanWithLighthouse,
  scanWithGTmetrix,
  scanWithBuiltWith,
  getGTmetrixUsage
} from './businessScanService';

import {
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
} from './businessUtilsService';

// Also export from the new scanning services
import { scanBusinessesInArea } from './scanningService';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { scanWithWebScraper } from './scanning/webScraperService';

// Re-export everything
export {
  // CRUD Operations
  getBusinesses,
  clearAllBusinesses,
  clearSelectedBusinesses,
  addBusiness,
  updateBusiness,
  
  // Scanning Operations
  scanWithLighthouse,
  scanWithGTmetrix,
  scanWithBuiltWith,
  getGTmetrixUsage,
  
  // New scanning APIs
  scanBusinessesInArea,
  scanWithGoogleMaps,
  scanWithWebScraper,
  
  // Utility Functions
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
};
