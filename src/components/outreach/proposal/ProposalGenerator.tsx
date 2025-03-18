
import React, { useState, useEffect } from 'react';
import { ProposalTemplate, getProposalTemplates } from '@/services/outreach/proposalService';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TargetSelector } from './TargetSelector';
import { TemplateSelector } from './TemplateSelector';
import { GenerateProposalButton } from './GenerateProposalButton';
import { GeneratedProposalView } from './GeneratedProposalView';
import { TemplatesList } from './TemplatesList';

interface ProposalGeneratorProps {
  businesses: Business[];
  opportunities: Opportunity[];
  selectedTarget: Business | Opportunity | null;
  onSelectTarget: (target: Business | Opportunity) => void;
  loading: boolean;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  businesses,
  opportunities,
  selectedTarget,
  onSelectTarget,
  loading
}) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [generatedProposal, setGeneratedProposal] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const fetchedTemplates = await getProposalTemplates();
        setTemplates(fetchedTemplates);
        
        // Set default template if available
        const defaultTemplate = fetchedTemplates.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Target and Template Selection Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TargetSelector 
            businesses={businesses}
            opportunities={opportunities}
            selectedTarget={selectedTarget}
            onSelectTarget={onSelectTarget}
            loading={loading}
          />
          
          <TemplateSelector
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            loadingTemplates={loadingTemplates}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            onTemplatesUpdate={setTemplates}
          />
        </div>
        
        <GenerateProposalButton
          selectedTarget={selectedTarget}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          selectedTemplateId={selectedTemplateId}
          onProposalGenerated={setGeneratedProposal}
        />
      </div>
      
      {/* Generated Proposal Section */}
      {generatedProposal && (
        <GeneratedProposalView proposal={generatedProposal} />
      )}
      
      {/* Templates Management Section */}
      {templates.length > 0 && (
        <TemplatesList 
          templates={templates} 
          onTemplatesUpdate={setTemplates} 
          onSelectedTemplateChange={setSelectedTemplateId}
          selectedTemplateId={selectedTemplateId}
          setIsDialogOpen={setIsDialogOpen}
        />
      )}
    </div>
  );
};

export default ProposalGenerator;
