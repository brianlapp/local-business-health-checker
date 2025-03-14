
// This file serves as a facade to the underlying specialized services
// It re-exports functions from the specialized services to maintain backward compatibility

// Export from the new discovery services
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

// Export from the outreach services
import {
  generateProposal,
  saveProposalTemplate
} from './outreach/proposalService';

// Re-export everything
export {
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
