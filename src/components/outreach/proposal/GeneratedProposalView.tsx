
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Markdown } from '@/components/ui/markdown';
import { toast } from 'sonner';

interface GeneratedProposalViewProps {
  proposal: string;
}

export const GeneratedProposalView: React.FC<GeneratedProposalViewProps> = ({ proposal }) => {
  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposal);
    toast.success('Proposal copied to clipboard');
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([proposal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Proposal downloaded');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Generated Proposal</h3>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyProposal}
            >
              Copy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadProposal}
            >
              Download
            </Button>
          </div>
        </div>
        
        <div className="border rounded-md p-4 bg-background mb-4">
          <ScrollArea className="h-[500px]">
            <Markdown>{proposal}</Markdown>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
