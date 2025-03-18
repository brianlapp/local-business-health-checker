
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface TemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTemplate: (name: string, content: string, isDefault: boolean) => void;
  initialName?: string;
  initialContent?: string;
  initialIsDefault?: boolean;
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onOpenChange,
  onSaveTemplate,
  initialName = '',
  initialContent = '',
  initialIsDefault = false
}) => {
  const [templateName, setTemplateName] = useState(initialName);
  const [templateContent, setTemplateContent] = useState(initialContent);
  const [isDefault, setIsDefault] = useState(initialIsDefault);
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setTemplateName(initialName);
      setTemplateContent(initialContent);
      setIsDefault(initialIsDefault);
    }
  }, [isOpen, initialName, initialContent, initialIsDefault]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Proposal Template</DialogTitle>
          <DialogDescription>
            Create a reusable template for your proposals. Use {'{targetName}'}, {'{targetWebsite}'}, 
            {'{targetIndustry}'} and {'{date}'} as placeholders.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="E.g., Standard Web Development Proposal"
            />
          </div>
          
          <div>
            <Label htmlFor="template-content">Template Content</Label>
            <Textarea
              id="template-content"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="# Proposal for {targetName}..."
              className="min-h-[300px] font-mono"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="is-default">Set as default template</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSaveTemplate(templateName, templateContent, isDefault)}>
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
