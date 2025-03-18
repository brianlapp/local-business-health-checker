
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { EmailTemplate } from '@/types/emailTemplate';
import { getEmailTemplates, getDefaultEmailTemplate } from '@/services/outreach/templates/emailTemplateService';

interface EmailComposerProps {
  target: Business | Opportunity | null;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ target }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  // Get target name and email for display
  const targetName = getTargetName(target);
  const targetEmail = getTargetEmail(target);
  const targetWebsite = getTargetWebsite(target);
  const targetScore = getTargetScore(target);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSubject(applyPlaceholders(template.subject));
        setContent(applyPlaceholders(template.content));
      }
    }
  }, [selectedTemplateId, target, templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templates = await getEmailTemplates();
      setTemplates(templates);
      
      // Try to get default template
      const defaultTemplate = await getDefaultEmailTemplate();
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      } else if (templates.length > 0) {
        setSelectedTemplateId(templates[0].id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPlaceholders = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/{{business_name}}/g, targetName || 'Your Business')
      .replace(/{{website_url}}/g, targetWebsite || 'your website')
      .replace(/{{score}}/g, targetScore !== undefined ? String(targetScore) : 'N/A');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success('Email content copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">To:</p>
                <span className="text-sm">
                  {targetEmail || 'No email available'}
                  {targetName && ` (${targetName})`}
                </span>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="template" className="text-sm font-medium">
                  Template
                </label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No templates available
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                          {template.is_default && " (Default)"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={10}
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="flex items-center gap-1"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions to extract target information
function getTargetName(target: Business | Opportunity | null): string {
  if (!target) return '';
  return 'client_name' in target ? target.client_name || '' : target.name;
}

function getTargetEmail(target: Business | Opportunity | null): string {
  if (!target) return '';
  
  if ('contact_info' in target && target.contact_info) {
    return typeof target.contact_info === 'object' && 'email' in target.contact_info 
      ? String(target.contact_info.email || '') 
      : '';
  }
  
  return '';
}

function getTargetWebsite(target: Business | Opportunity | null): string {
  if (!target) return '';
  
  if ('website' in target) {
    return target.website || '';
  } else if ('client_website' in target) {
    return target.client_website || '';
  }
  
  return '';
}

function getTargetScore(target: Business | Opportunity | null): number | undefined {
  if (!target) return undefined;
  
  if ('opportunity_score' in target) {
    return target.opportunity_score || undefined;
  } else if ('score' in target) {
    return target.score || undefined;
  }
  
  return undefined;
}

export default EmailComposer;
