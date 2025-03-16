
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
  addAgency,
  analyzeAgencyPortfolio
} from './discovery/agency'; // Updated import path

import { 
  searchJobs, 
  saveJobAsOpportunity 
} from './discovery/jobBoardService';

// Import from outreach services
import {
  generateProposal,
  saveProposalTemplate
} from './outreach/proposalService';

// Import from evaluation services
import {
  evaluateOpportunity,
  evaluateOpportunities,
  saveOpportunityScore,
  getUserEvaluationCriteria
} from './evaluation/opportunityEvaluationService';

// Make sure we also have the function from apiService
import { getBusinesses as getBusinessesFromApi } from './apiService';

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
  analyzeAgencyPortfolio,
  
  // Job Board Operations
  searchJobs,
  saveJobAsOpportunity,
  
  // Proposal Operations
  generateProposal,
  saveProposalTemplate,
  
  // Opportunity Evaluation Operations
  evaluateOpportunity,
  evaluateOpportunities,
  saveOpportunityScore,
  getUserEvaluationCriteria,
  
  // Alternative implementations
  getBusinessesFromApi
};
