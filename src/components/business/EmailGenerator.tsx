
import React, { useState } from 'react';
import { Business } from '@/types/business';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEmailDraft, scheduleEmail } from '@/services/outreach/emailService';
import { CalendarIcon, Send, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmailGeneratorProps {
  business: Business;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ business }) => {
  const [emailSubject, setEmailSubject] = useState<string>(`Improve Your Website Performance - ${business.opportunity_score ? business.opportunity_score : 'Multiple'} Issues Found`);
  const [emailBody, setEmailBody] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const generateEmail = () => {
    const defaultEmailBody = `
Hello ${business.name} team,

I recently came across your website (${business.website}) and noticed some performance issues that might be affecting your user experience and search rankings.

Your website currently scores ${business.lighthouse_score ? business.lighthouse_score : 'poorly'}/100 on our assessment, indicating some opportunities for improvement.

Key issues we identified:
${business.lighthouse_score && business.lighthouse_score < 80 ? '- Slow loading times affecting user experience and SEO\n' : ''}
${business.cms?.toLowerCase().includes('wordpress') ? '- Outdated CMS potentially creating security vulnerabilities\n' : ''}
${!business.is_mobile_friendly ? '- Mobile responsiveness issues affecting a large segment of your visitors\n' : ''}

I'd be happy to discuss how we could help you address these issues to improve your website's performance.

Would you be available for a quick 15-minute call to discuss these findings?

Best regards,
Your Name
your@email.com
`;

    setEmailBody(defaultEmailBody);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !emailBody) {
      generateEmail();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailBody).then(() => {
      toast.success('Email template copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy email template');
    });
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      const draft = await createEmailDraft(
        emailSubject,
        emailBody,
        'business',
        business.id
      );
      
      if (draft) {
        toast.success('Email saved as draft');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleForLater = async () => {
    if (!scheduleDate) {
      toast.error('Please select a date');
      return;
    }
    
    setIsSaving(true);
    try {
      // First create a draft
      const draft = await createEmailDraft(
        emailSubject,
        emailBody,
        'business',
        business.id
      );
      
      if (draft) {
        // Then schedule it
        const scheduled = await scheduleEmail(draft.id, scheduleDate);
        if (scheduled) {
          toast.success('Email scheduled successfully');
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      toast.error('Failed to schedule email');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          Generate Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Email Generator</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Email to {business.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                className="min-h-[300px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Button variant="outline" onClick={copyToClipboard}>
                Copy to Clipboard
              </Button>
            </div>
            <div className="flex gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{scheduleDate ? format(scheduleDate, 'PPP') : 'Schedule'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={scheduleDate}
                    onSelect={(date) => {
                      setScheduleDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="secondary" 
                onClick={saveAsDraft}
                disabled={isSaving}
              >
                Save as Draft
              </Button>
              
              {scheduleDate ? (
                <Button 
                  onClick={scheduleForLater} 
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {isSaving ? 'Scheduling...' : 'Schedule'}
                </Button>
              ) : (
                <Button 
                  onClick={saveAsDraft} 
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Email'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default EmailGenerator;
