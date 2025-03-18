
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, SendHorizonal, CheckCircle } from 'lucide-react';
import { sendEmail } from '@/services/outreach/emails/emailSendingService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmailSenderProps {
  recipient: string;
  subject: string;
  content: string;
  templateId?: string;
  onSent?: (success: boolean, trackingId?: string) => void;
  disabled?: boolean;
}

const EmailSender: React.FC<EmailSenderProps> = ({
  recipient,
  subject,
  content,
  templateId,
  onSent,
  disabled = false
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  const handleSendClick = () => {
    if (!recipient) {
      toast.error('Recipient email is required');
      return;
    }
    
    if (!subject || !content) {
      toast.error('Subject and content are required');
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };
  
  const handleConfirmSend = async () => {
    setIsSending(true);
    setSentStatus('idle');
    
    try {
      const response = await sendEmail({
        to: recipient,
        subject: subject,
        content: content,
        templateId: templateId
      });
      
      if (response.success) {
        setSentStatus('success');
        setTrackingId(response.tracking_id || null);
        toast.success('Email sent successfully');
        
        if (onSent) {
          onSent(true, response.tracking_id);
        }
      } else {
        setSentStatus('error');
        toast.error(response.error || 'Failed to send email');
        
        if (onSent) {
          onSent(false);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSentStatus('error');
      toast.error('Failed to send email');
      
      if (onSent) {
        onSent(false);
      }
    } finally {
      setIsSending(false);
      // Close dialog after sending is complete
      setShowConfirmDialog(false);
    }
  };
  
  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-1"
        disabled={disabled || isSending || !recipient}
        onClick={handleSendClick}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : sentStatus === 'success' ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Sent
          </>
        ) : (
          <>
            <SendHorizonal className="h-4 w-4" />
            Send Email
          </>
        )}
      </Button>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this email to {recipient}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Subject:</p>
              <p className="text-sm text-muted-foreground">{subject}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Preview:</p>
              <div className="max-h-[200px] overflow-y-auto rounded border border-muted bg-muted/20 p-3">
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              disabled={isSending} 
              onClick={handleConfirmSend}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailSender;
