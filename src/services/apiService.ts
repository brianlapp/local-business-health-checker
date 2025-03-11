
// This file serves as a facade to the underlying specialized services
// It re-exports functions from the specialized services to maintain backward compatibility

import { scanBusinessesInArea } from './scanningService';
import { addBusiness, getBusinesses } from './businessCrudService';
import { generateIssues, isCMSOutdated, isWebsiteSecure } from './businessUtilsService';
import { scanWithGoogleMaps } from './scanning/googleMapsScanner';
import { scanWithWebScraper } from './scanning/webScraperService';

// Re-export everything
export {
  scanBusinessesInArea,
  scanWithGoogleMaps,
  scanWithWebScraper,
  addBusiness,
  getBusinesses,
  generateIssues,
  isCMSOutdated,
  isWebsiteSecure
};
