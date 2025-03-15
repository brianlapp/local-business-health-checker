
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';

interface PortfolioLinksProps {
  links: string[];
}

const PortfolioLinks: React.FC<PortfolioLinksProps> = ({ links }) => {
  if (links.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No portfolio pages found</AlertTitle>
        <AlertDescription>
          No portfolio pages found. The agency may not have a portfolio section on their website.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded border hover:bg-muted flex items-center"
          >
            {link}
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PortfolioLinks;
