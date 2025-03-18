
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalTemplate, getProposalTemplates } from '@/services/outreach/templateService';
import { generateProposal, saveProposal } from '@/services/outreach/proposalService';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ProposalGeneratorProps {
  entity: Business | Opportunity;
  entityType: 'business' | 'opportunity' | 'agency';
  onProposalSaved?: () => void;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  entity,
  entityType,
  onProposalSaved
}) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [proposalContent, setProposalContent] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      const templatesData = await getProposalTemplates();
      setTemplates(templatesData);
      
      // Find default template for this entity type
      const defaultTemplate = templatesData.find(
        t => t.is_default && t.category === entityType
      );
      
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
        handleGenerateProposal(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };
  
  const handleGenerateProposal = async (templateId?: string) => {
    setLoading(true);
    try {
      const content = await generateProposal(
        entity, 
        templateId || selectedTemplateId,
        customVariables
      );
      
      setProposalContent(content);
      
      // Set default subject based on entity
      if (!subject) {
        if ('title' in entity) {
          setSubject(`Proposal: ${entity.title}`);
        } else {
          setSubject(`Proposal for ${entity.name} Website Improvement`);
        }
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProposal = async () => {
    if (!proposalContent.trim()) {
      toast.error('Please generate a proposal first');
      return;
    }
    
    setSaving(true);
    try {
      const success = await saveProposal(
        entityType,
        entity.id,
        proposalContent,
        subject
      );
      
      if (success) {
        toast.success('Proposal saved successfully');
        onProposalSaved?.();
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast.error('Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };
  
  const handleVariableChange = (key: string, value: string) => {
    setCustomVariables({
      ...customVariables,
      [key]: value
    });
  };
  
  // Get variables from the selected template
  const getSelectedTemplateVariables = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    return template?.variables || [];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select 
              value={selectedTemplateId} 
              onValueChange={(value) => {
                setSelectedTemplateId(value);
                handleGenerateProposal(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} {template.is_default ? '(Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {getSelectedTemplateVariables().length > 0 && (
            <div className="space-y-2">
              <Label>Custom Variables</Label>
              <div className="grid grid-cols-2 gap-4">
                {getSelectedTemplateVariables().map((variable) => (
                  <div key={variable} className="space-y-1">
                    <Label htmlFor={`var-${variable}`}>{variable}</Label>
                    <Input
                      id={`var-${variable}`}
                      value={customVariables[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      placeholder={`Enter value for ${variable}`}
                    />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateProposal()}
                className="mt-2"
              >
                Regenerate with Variables
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter proposal subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proposal-content">Proposal Content</Label>
            <Textarea
              id="proposal-content"
              value={proposalContent}
              onChange={(e) => setProposalContent(e.target.value)}
              className="min-h-[300px] font-mono"
              placeholder={loading ? 'Generating proposal...' : 'Select a template to generate a proposal'}
              disabled={loading}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={() => handleGenerateProposal()}
            disabled={loading || !selectedTemplateId}
          >
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button
            onClick={handleSaveProposal}
            disabled={saving || !proposalContent.trim()}
          >
            {saving ? 'Saving...' : 'Save Proposal'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProposalGenerator;
