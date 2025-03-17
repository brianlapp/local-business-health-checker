
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
          <Card key={index} className="overflow-hidden group hover:shadow-md transition-all duration-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate text-sm">{link}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="hidden group-hover:inline-flex">
                          Portfolio
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Agency portfolio page</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <a 
                    href={link.startsWith('http') ? link : `https://${link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    aria-label="Open link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PortfolioLinks;
