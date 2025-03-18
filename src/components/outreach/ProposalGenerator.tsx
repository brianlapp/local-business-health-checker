import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { 
  generateProposal, 
  getProposalTemplates, 
  saveProposalTemplate, 
  deleteProposalTemplate, 
  ProposalTemplate 
} from '@/services/outreach/proposalService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Markdown } from '@/components/ui/markdown';
import { toast } from 'sonner';

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
  
  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
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
  
  const handleGenerateProposal = async () => {
    if (!selectedTarget) {
      toast.error('Please select a target business or opportunity first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const proposal = await generateProposal(selectedTarget, selectedTemplateId || undefined);
      setGeneratedProposal(proposal);
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast.error('Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
      toast.error('Template name and content are required');
      return;
    }
    
    try {
      await saveProposalTemplate(templateName, templateContent, isDefault);
      
      // Reset form and refresh templates
      setTemplateName('');
      setTemplateContent('');
      setIsDefault(false);
      setIsDialogOpen(false);
      
      // Refresh templates list
      const freshTemplates = await getProposalTemplates();
      setTemplates(freshTemplates);
      
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };
  
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteProposalTemplate(templateId);
        
        // Remove from state and clear selection if it was selected
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId('');
        }
        
        toast.success('Template deleted successfully');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
      }
    }
  };
  
  const handleEditTemplate = (template: ProposalTemplate) => {
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setIsDefault(template.is_default || false);
    setIsDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Target Selection Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="target-type">Target Type</Label>
            <Tabs defaultValue="business" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="business" className="space-y-4">
                <Select 
                  disabled={loading || businesses.length === 0}
                  onValueChange={(value) => {
                    const selected = businesses.find(b => b.id === value);
                    if (selected) onSelectTarget(selected);
                  }}
                  value={selectedTarget && 'name' in selectedTarget ? selectedTarget.id : ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="opportunity" className="space-y-4">
                <Select 
                  disabled={loading || opportunities.length === 0}
                  onValueChange={(value) => {
                    const selected = opportunities.find(o => o.id === value);
                    if (selected) onSelectTarget(selected);
                  }}
                  value={selectedTarget && 'title' in selectedTarget ? selectedTarget.id : ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunities.map(opportunity => (
                      <SelectItem key={opportunity.id} value={opportunity.id}>
                        {opportunity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Label htmlFor="template">Proposal Template</Label>
            <div className="flex items-center gap-2">
              <Select 
                disabled={loadingTemplates}
                onValueChange={setSelectedTemplateId}
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
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
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
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      Save Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <Button 
          disabled={!selectedTarget || isGenerating} 
          onClick={handleGenerateProposal}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Proposal
            </>
          )}
        </Button>
      </div>
      
      {/* Generated Proposal Section */}
      {generatedProposal && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Generated Proposal</h3>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedProposal);
                    toast.success('Proposal copied to clipboard');
                  }}
                >
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const blob = new Blob([generatedProposal], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `proposal-${new Date().toISOString().split('T')[0]}.md`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Proposal downloaded');
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4 bg-background mb-4">
              <ScrollArea className="h-[500px]">
                <Markdown>{generatedProposal}</Markdown>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Templates Management Section */}
      {templates.length > 0 && (
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
      )}
    </div>
  );
};

export default ProposalGenerator;
