
import React, { useState } from 'react';
import { Business } from '@/types/business';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, Copy, SendIcon, SaveIcon, CheckIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailGeneratorProps {
  business: Business;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ business }) => {
  const [emailSubject, setEmailSubject] = useState(`Improve Your Website Performance - ${business.score} Issues Found`);
  const [emailBody, setEmailBody] = useState(generateDefaultEmailBody(business));
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock email templates - in a real app, these would come from the database
  const emailTemplates: EmailTemplate[] = [
    {
      id: 'default',
      name: 'Website Performance',
      subject: `Improve Your Website Performance - ${business.score} Issues Found`,
      body: generateDefaultEmailBody(business)
    },
    {
      id: 'followup',
      name: 'Follow-up',
      subject: `Following Up: Website Improvement Proposal for ${business.name}`,
      body: `
Hello ${business.name} team,

I wanted to follow up on my previous message regarding your website performance. 

Have you had a chance to review the issues I identified? I'd be happy to discuss potential solutions at your convenience.

Looking forward to hearing from you.

Best regards,
[Your Name]
      `
    },
    {
      id: 'meeting',
      name: 'Meeting Request',
      subject: `Quick Call to Discuss ${business.name}'s Web Presence`,
      body: `
Hello ${business.name} team,

I've been analyzing websites in your industry and noticed some opportunities to enhance your online presence.

Would you be available for a brief 15-minute call next week to discuss some specific improvements that could help your business generate more leads and improve user experience?

I'm available Monday through Thursday between 9am and 4pm, or I can work around your schedule.

Best regards,
[Your Name]
      `
    }
  ];

  const handleTemplateChange = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      setSelectedTemplate(templateId);
    }
  };

  const handleCopyToClipboard = () => {
    const fullEmail = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullEmail).then(() => {
      setIsCopied(true);
      toast.success('Email template copied to clipboard');
      
      // Reset the "Copied" state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }).catch(() => {
      toast.error('Failed to copy email template');
    });
  };
  
  const handleSendEmail = () => {
    // This would connect to a backend service to send the email
    setIsSending(true);
    
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Email sent to ${recipientEmail || 'recipient'}`);
      setIsOpen(false);
    }, 1500);
  };
  
  const handleSaveTemplate = () => {
    // This would save the template to the database
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Email template saved');
    }, 1000);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <MailIcon className="mr-2 h-4 w-4" />
          Generate Email
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[600px] p-0" align="end">
        <Tabs defaultValue="compose">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Email to {business.name}</CardTitle>
                <CardDescription>
                  Customize the email template before copying or sending
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={12}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleCopyToClipboard}>
                  {isCopied ? (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                
                <Button onClick={handleSaveTemplate} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Template
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Manage your email templates or create new ones
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {emailTemplates.map(template => (
                    <div 
                      key={template.id} 
                      className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleTemplateChange(template.id)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {template.subject}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" className="w-full">
                  + Create New Template
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

// Helper function to generate default email body based on business data
function generateDefaultEmailBody(business: Business): string {
  return `
Hello ${business.name} team,

I recently came across your website (${business.website}) and noticed some performance issues that might be affecting your user experience and search rankings.

Your website currently scores ${business.score}/100 on our assessment, indicating some opportunities for improvement.

Key issues we identified:
${business.issues?.speedIssues ? '- Slow loading times affecting user experience and SEO\n' : ''}
${business.issues?.outdatedCMS ? '- Outdated CMS potentially creating security vulnerabilities\n' : ''}
${business.issues?.noSSL ? '- Missing SSL certificate (https) which can affect search rankings\n' : ''}
${business.issues?.notMobileFriendly ? '- Mobile responsiveness issues affecting a large segment of your visitors\n' : ''}
${business.issues?.badFonts ? '- Typography issues that may impact readability and brand perception\n' : ''}

I'd be happy to discuss how we could help you address these issues to improve your website's performance.

Would you be available for a quick 15-minute call to discuss these findings?

Best regards,
[Your Name]
[Your Contact Info]
  `;
}

export default EmailGenerator;
