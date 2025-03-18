
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { ProposalTemplate, getProposalTemplates, saveProposalTemplate } from '@/services/outreach/proposalService';
import { TemplateDialog } from './TemplateDialog';
import { toast } from 'sonner';

interface TemplateSelectorProps {
  templates: ProposalTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  loadingTemplates: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onTemplatesUpdate: (templates: ProposalTemplate[]) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  loadingTemplates,
  isDialogOpen,
  setIsDialogOpen,
  onTemplatesUpdate
}) => {
  const handleSaveTemplate = async (templateName: string, templateContent: string, isDefault: boolean) => {
    if (!templateName || !templateContent) {
      toast.error('Template name and content are required');
      return;
    }
    
    try {
      await saveProposalTemplate(templateName, templateContent, isDefault);
      setIsDialogOpen(false);
      
      // Refresh templates list
      const freshTemplates = await getProposalTemplates();
      onTemplatesUpdate(freshTemplates);
      
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <div>
      <Label htmlFor="template">Proposal Template</Label>
      <div className="flex items-center gap-2">
        <Select 
          disabled={loadingTemplates}
          onValueChange={onSelectTemplate}
          value={selectedTemplateId}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a template or use default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default Template</SelectItem>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} {template.is_default && '(Default)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <TemplateDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSaveTemplate={handleSaveTemplate}
        />
        
        <Button variant="outline" size="icon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
