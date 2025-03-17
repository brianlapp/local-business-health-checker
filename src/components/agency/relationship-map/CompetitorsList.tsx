
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2Icon, RefreshCw, UsersIcon } from 'lucide-react';
import { Business } from '@/types/business';

interface CompetitorsListProps {
  competitors: Business[];
  loading: boolean;
  agencyName: string;
}

const CompetitorsList: React.FC<CompetitorsListProps> = ({
  competitors,
  loading,
  agencyName
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Separator className="my-3" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="text-center py-8">
        <UsersIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-medium mb-1">No Competitors Found</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {agencyName} doesn't share clients with any other agencies in your database.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="/agency-analysis">Analyze More Agencies</a>
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {competitors.map((competitor) => (
          <Card key={competitor.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="mb-2">
                <h4 className="font-medium">{competitor.name}</h4>
                {competitor.website && (
                  <a 
                    href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {competitor.website}
                  </a>
                )}
              </div>
              
              <Separator className="my-3" />
              
              <div className="text-sm">
                <div className="flex items-center text-muted-foreground mb-1">
                  <Building2Icon className="h-3.5 w-3.5 mr-1.5" />
                  {competitor.industry || 'Unknown industry'}
                </div>
                
                {competitor.location && (
                  <div className="text-muted-foreground">
                    Location: {competitor.location}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CompetitorsList;
