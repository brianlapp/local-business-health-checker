
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
  
  // Utility Functions
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
};
