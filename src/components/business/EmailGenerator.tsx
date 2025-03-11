
import React from 'react';
import { Business } from '@/types/business';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmailGeneratorProps {
  business: Business;
}

const EmailGenerator: React.FC<EmailGeneratorProps> = ({ business }) => {
  const handleEmailGeneration = () => {
    const emailSubject = `Improve Your Website Performance - ${business.score} Issues Found`;
    const emailBody = `
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
Your Name
your@email.com
    `;

    // Copy to clipboard functionality
    navigator.clipboard.writeText(emailBody).then(() => {
      toast.success('Email template copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy email template');
    });
  };

  return (
    <Button onClick={handleEmailGeneration}>
      Generate Email
    </Button>
  );
};

export default EmailGenerator;
