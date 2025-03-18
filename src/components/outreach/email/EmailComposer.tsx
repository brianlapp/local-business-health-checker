
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { EmailTemplate } from '@/types/emailTemplate';
import { getEmailTemplates, getDefaultEmailTemplate } from '@/services/outreach/templates/emailTemplateService';

const formSchema = z.object({
  to: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Email content is required'),
  templateId: z.string().optional(),
});

type EmailFormValues = z.infer<typeof formSchema>;

interface EmailComposerProps {
  target: Business | Opportunity | null;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ target }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      content: '',
      templateId: '',
    },
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    // Set recipient email if target has one
    if (target) {
      if ('contact_info' in target && target.contact_info?.email) {
        form.setValue('to', target.contact_info.email);
      } else if ('email' in target && target.email) {
        form.setValue('to', target.email);
      }
    }
  }, [target, form]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templates = await getEmailTemplates();
      setTemplates(templates);
      
      // If we have templates, check for a default
      if (templates.length > 0) {
        const defaultTemplate = templates.find(t => t.is_default) || templates[0];
        await handleTemplateSelect(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      let subject = template.subject;
      let content = template.content;
      
      // Replace placeholders with target data
      if (target) {
        const targetName = 'name' in target ? target.name : (target.title || 'Client');
        const targetWebsite = 'website' in target ? target.website : '';
        const targetScore = 'score' in target ? target.score?.toString() : '';
        
        subject = subject.replace(/{{business_name}}/g, targetName)
                         .replace(/{{website_url}}/g, targetWebsite)
                         .replace(/{{score}}/g, targetScore);
                         
        content = content.replace(/{{business_name}}/g, targetName)
                         .replace(/{{website_url}}/g, targetWebsite)
                         .replace(/{{score}}/g, targetScore);
      }
      
      form.setValue('subject', subject);
      form.setValue('content', content);
      form.setValue('templateId', templateId);
    }
  };

  const handleCopyToClipboard = () => {
    const values = form.getValues();
    const emailText = `To: ${values.to}\nSubject: ${values.subject}\n\n${values.content}`;
    
    navigator.clipboard.writeText(emailText).then(() => {
      toast.success('Email copied to clipboard');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  const onSubmit = async (values: EmailFormValues) => {
    setIsSending(true);
    try {
      // In a real application, we would send the email through an API
      console.log('Sending email:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Email sent to ${values.to}`);
      // Optionally reset form or redirect
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select
                    disabled={isLoading || templates.length === 0}
                    value={field.value}
                    onValueChange={(value) => handleTemplateSelect(value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose an email template or create a new one in the templates section
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <FormControl>
                    <Input placeholder="client@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Email address of the recipient
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Subject of your email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your email content here..."
                      rows={12}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EmailComposer;
