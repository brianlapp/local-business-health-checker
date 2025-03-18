
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { ProposalTemplate, deleteProposalTemplate, getProposalTemplates } from '@/services/outreach/proposalService';
import { toast } from 'sonner';

interface TemplatesListProps {
  templates: ProposalTemplate[];
  onTemplatesUpdate: (templates: ProposalTemplate[]) => void;
  onSelectedTemplateChange: (id: string) => void;
  selectedTemplateId: string;
  setIsDialogOpen: (open: boolean) => void;
}

export const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  onTemplatesUpdate,
  onSelectedTemplateChange,
  selectedTemplateId,
  setIsDialogOpen
}) => {
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteProposalTemplate(templateId);
        
        // Remove from state and clear selection if it was selected
        onTemplatesUpdate(templates.filter(t => t.id !== templateId));
        if (selectedTemplateId === templateId) {
          onSelectedTemplateChange('');
        }
        
        toast.success('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
      }
    }
  };
  
  const handleEditTemplate = (template: ProposalTemplate) => {
    // This will be handled by the parent component using a dialog
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="flex flex-col">
            <CardContent className="pt-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <div className="space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-muted-foreground text-sm mb-2">
                {template.created_at && (
                  <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                )}
              </div>
              <div className="border rounded-md p-2 bg-muted/50 overflow-hidden whitespace-nowrap overflow-ellipsis flex-1">
                <code className="text-xs text-muted-foreground">
                  {template.content.substring(0, 100)}...
                </code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
