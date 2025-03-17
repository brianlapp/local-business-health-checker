
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface PortfolioLinksProps {
  links: string[];
}

const PortfolioLinks: React.FC<PortfolioLinksProps> = ({ links }) => {
  if (links.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No portfolio links found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {links.map((link, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-3">
              <a 
                href={link.startsWith('http') ? link : `https://${link}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm flex items-center justify-between hover:underline text-blue-600 dark:text-blue-400"
              >
                <span className="truncate flex-1">{link}</span>
                <ExternalLink className="w-3 h-3 ml-2 flex-shrink-0" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PortfolioLinks;
