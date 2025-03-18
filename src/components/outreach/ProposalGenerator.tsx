
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Copy, Download, Save, FileText, CheckIcon } from 'lucide-react';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { 
  generateProposal, 
  saveProposalTemplate, 
  getProposalTemplates, 
  ProposalTemplate 
} from '@/services/outreach/proposalService';

interface ProposalGeneratorProps {
  target: Business | Opportunity;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ target }) => {
  const [proposalContent, setProposalContent] = useState<string>('');
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('editor');

  // Determine if we're dealing with a business or opportunity
  const isBusiness = 'name' in target && !('title' in target);
  const targetName = isBusiness ? (target as Business).name : (target as Opportunity).title;

  useEffect(() => {
    loadTemplates();
    handleGenerateProposal();
  }, [target]);

  const loadTemplates = async () => {
    const loadedTemplates = await getProposalTemplates();
    setTemplates(loadedTemplates);
    
    // If there's a default template, select it
    const defaultTemplate = loadedTemplates.find(t => t.is_default);
    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate.id);
    }
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      const content = await generateProposal(target, selectedTemplate || undefined);
      setProposalContent(content);
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveProposalTemplate(newTemplateName, proposalContent, isDefault);
      setNewTemplateName('');
      await loadTemplates();
      setActiveTab('templates');
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(proposalContent)
      .then(() => {
        setIsCopied(true);
        toast.success('Proposal copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy proposal');
      });
  };

  const handleDownload = () => {
    const blob = new Blob([proposalContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal_for_${targetName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Proposal downloaded');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      handleGenerateProposal();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Proposal Generator
        </CardTitle>
        <CardDescription>
          Generate and customize proposals for {targetName}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="p-0">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="template-select">Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Template (Generate Default)</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} {template.is_default ? '(Default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGenerateProposal}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposal-content">Proposal Content</Label>
              <Textarea 
                id="proposal-content"
                value={proposalContent}
                onChange={(e) => setProposalContent(e.target.value)}
                className="h-[400px] font-mono text-sm"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full flex flex-row gap-4">
              <Button 
                className="flex-1" 
                variant="outline" 
                onClick={handleCopyToClipboard}
              >
                {isCopied ? (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            
            <div className="w-full border-t pt-4">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="template-name">Save as Template</Label>
                  <Input
                    id="template-name"
                    placeholder="Template Name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Switch 
                    id="set-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                  <Label htmlFor="set-default">Set as Default</Label>
                </div>
                
                <Button 
                  onClick={handleSaveTemplate}
                  disabled={isSaving || !newTemplateName.trim()}
                >
                  {isSaving ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="templates">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {templates.length > 0 ? (
                templates.map(template => (
                  <div 
                    key={template.id} 
                    className="p-4 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setActiveTab('editor');
                      handleGenerateProposal();
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{template.name}</div>
                      {template.is_default && (
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Default
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(template.created_at || '').toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {template.content.substring(0, 150)}...
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found. Create one by saving a proposal.
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTab('editor')}
            >
              + Create New Template
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ProposalGenerator;
