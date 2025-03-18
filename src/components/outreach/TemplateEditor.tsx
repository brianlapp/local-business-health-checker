
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProposalTemplate, saveProposalTemplate, updateProposalTemplate } from '@/services/outreach/templateService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateEditorProps {
  template?: ProposalTemplate;
  onSave?: (template: ProposalTemplate) => void;
  onCancel?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  template, 
  onSave, 
  onCancel 
}) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'business');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [newVariable, setNewVariable] = useState('');
  const [isDefault, setIsDefault] = useState(template?.is_default || false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!template?.id;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!content.trim()) {
      toast.error('Template content is required');
      return;
    }

    setIsSaving(true);

    try {
      const templateData = {
        name,
        content,
        category,
        variables,
        is_default: isDefault,
        ...(isEditing ? { id: template.id } : {})
      };

      const savedTemplate = isEditing
        ? await updateProposalTemplate(templateData as ProposalTemplate)
        : await saveProposalTemplate(templateData);

      if (savedTemplate) {
        toast.success(`Template ${isEditing ? 'updated' : 'created'} successfully`);
        onSave?.(savedTemplate);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const addVariable = () => {
    if (!newVariable.trim()) return;
    if (variables.includes(newVariable)) {
      toast.error('Variable already exists');
      return;
    }
    setVariables([...variables, newVariable]);
    setNewVariable('');
  };

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const { selectionStart, selectionEnd } = textarea;
      const variableTag = `{{${variable}}}`;
      const newContent = 
        content.substring(0, selectionStart) + 
        variableTag + 
        content.substring(selectionEnd);
      
      setContent(newContent);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selectionStart + variableTag.length,
          selectionStart + variableTag.length
        );
      }, 0);
    }
  };

  // Generate a preview with sample data
  const generatePreview = () => {
    let preview = content;
    
    // Replace variables with sample values
    preview = preview.replace(/{{name}}/g, 'Sample Business Name');
    preview = preview.replace(/{{client_name}}/g, 'John Smith');
    preview = preview.replace(/{{date}}/g, new Date().toLocaleDateString());
    preview = preview.replace(/{{website}}/g, 'www.example.com');
    preview = preview.replace(/{{score}}/g, '75');
    preview = preview.replace(/{{lighthouse_score}}/g, '85');
    preview = preview.replace(/{{gtmetrix_score}}/g, '80');
    preview = preview.replace(/{{description}}/g, 'This is a sample project description.');
    preview = preview.replace(/{{budget}}/g, '$5,000 - $10,000 USD');
    preview = preview.replace(/{{skills}}/g, 'Web Development, Design, SEO');
    preview = preview.replace(/{{cms}}/g, 'WordPress');
    
    // Replace any remaining variables
    preview = preview.replace(/{{.*?}}/g, '[Sample Value]');
    
    return preview;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Template' : 'Create Template'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-category">Category</Label>
              <select
                id="template-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="business">Business</option>
                <option value="opportunity">Opportunity</option>
                <option value="agency">Agency</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="is-default">Set as default template for this category</Label>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="variables">Template Variables</Label>
              <div className="flex gap-2">
                <Input
                  id="new-variable"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="New variable"
                  className="w-40"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addVariable}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {variables.map((variable) => (
                <div 
                  key={variable}
                  className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm"
                >
                  <span 
                    className="cursor-pointer mr-2"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariable(variable)}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {variables.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No variables added. Variables will be replaced with actual values when generating a proposal.
                </div>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter template content. Use {{variable}} syntax for variables."
                  className="min-h-[300px] font-mono"
                />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-md p-4 min-h-[300px] whitespace-pre-wrap">
                  {generatePreview()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : isEditing ? 'Update Template' : 'Save Template'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateEditor;
