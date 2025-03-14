
// This file serves as a facade to the underlying specialized services
// It re-exports functions from the specialized services to maintain backward compatibility

// Import from business CRUD services
import {
  getBusinesses,
  clearAllBusinesses,
  clearSelectedBusinesses,
  addBusiness,
  updateBusiness
} from './businessCrudService';

// Import from scanning services
import {
  scanBusinessesInArea,
  scanWithLighthouse,
  scanWithGTmetrix,
  scanWithBuiltWith,
  getBusinessesNeedingRealScores,
  getGTmetrixUsage
} from './scanningService';

// Import from discovery services
import {
  searchLocalBusinesses,
  addLocalBusiness,
  getLocalBusinesses
} from './discovery/businessScanService';

import {
  findAgencies,
  addAgency
} from './discovery/agencyFinderService';

import { 
  searchJobs, 
  saveJobAsOpportunity 
} from './discovery/jobBoardService';

// Import from outreach services
import {
  generateProposal,
  saveProposalTemplate
} from './outreach/proposalService';

// Re-export everything
export {
  // Business CRUD Operations
  getBusinesses,
  clearAllBusinesses,
  clearSelectedBusinesses,
  addBusiness,
  updateBusiness,
  
  // Scanning Operations
  scanBusinessesInArea,
  scanWithLighthouse,
  scanWithGTmetrix,
  scanWithBuiltWith,
  getBusinessesNeedingRealScores,
  getGTmetrixUsage,
  
  // Business Discovery Operations
  searchLocalBusinesses,
  addLocalBusiness,
  getLocalBusinesses,
  
  // Agency Operations
  findAgencies,
  addAgency,
  
  // Job Board Operations
  searchJobs,
  saveJobAsOpportunity,
  
  // Proposal Operations
  generateProposal,
  saveProposalTemplate
};
