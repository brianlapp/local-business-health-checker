
// This file re-exports functions from the specialized modules for backward compatibility

import { 
  ProposalTemplate,
  saveProposalTemplate, 
  getProposalTemplates, 
  deleteProposalTemplate,
  getProposalTemplateById,
  getDefaultProposalTemplate
} from './templates/proposalTemplateService';

import { 
  generateProposal 
} from './proposals/proposalGenerationService';

// Re-export everything
export type { ProposalTemplate };

export {
  // Proposal generation
  generateProposal,
  
  // Template management
  saveProposalTemplate,
  getProposalTemplates,
  deleteProposalTemplate,
  getProposalTemplateById,
  getDefaultProposalTemplate
};
