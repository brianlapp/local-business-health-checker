
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
  getGTmetrixUsage,
  getBusinessesNeedingRealScores
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

// Export from the new job board service
import { 
  searchJobs, 
  saveJobAsOpportunity 
} from './discovery/jobBoardService';

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
  getBusinessesNeedingRealScores,
  
  // New scanning APIs
  scanBusinessesInArea,
  scanWithGoogleMaps,
  scanWithWebScraper,
  
  // Job Board Operations
  searchJobs,
  saveJobAsOpportunity,
  
  // Utility Functions
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
};
