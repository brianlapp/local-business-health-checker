
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { EmailTemplate } from '@/types/emailTemplate';
import { saveEmailTemplate } from '@/services/outreach/templates/emailTemplateService';

const formSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  subject: z.string().min(1, 'Email subject is required'),
  content: z.string().min(1, 'Email content is required'),
  is_default: z.boolean().optional(),
});

type TemplateFormValues = z.infer<typeof formSchema>;

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave?: (id: string) => void;
  onCancel?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      content: template?.content || '',
      is_default: template?.is_default || false,
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        subject: template.subject,
        content: template.content,
        is_default: template.is_default || false,
      });
    }
  }, [template, form]);

  const onSubmit = async (values: TemplateFormValues) => {
    setIsSaving(true);
    try {
      const templateId = await saveEmailTemplate(values);
      if (templateId) {
        toast.success('Email template saved successfully');
        if (onSave) {
          onSave(templateId);
        }
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {template ? 'Edit Email Template' : 'Create New Email Template'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Introduction Email" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for your template
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
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Improving Your Website Performance" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The subject line that recipients will see
                  </FormDescription>
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
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {{business_name}}, {{website_url}}, and {{score}} as placeholders that will be replaced with actual values
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Set as Default Template</FormLabel>
                    <FormDescription>
                      This template will be selected by default when creating new emails
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TemplateEditor;
