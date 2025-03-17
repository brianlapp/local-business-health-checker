
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users2Icon, CalendarIcon, LinkIcon, Building2Icon } from 'lucide-react';
import { Business } from '@/types/business';
import { AgencyClientRelationship } from '@/services/discovery/agency/agencyRelationshipService';
import { format, parseISO } from 'date-fns';

interface RelationshipsListProps {
  agencyClients: Array<{
    relationship: AgencyClientRelationship;
    client?: Business;
  }>;
  agencyName: string;
}

const RelationshipsList: React.FC<RelationshipsListProps> = ({
  agencyClients,
  agencyName
}) => {
  if (agencyClients.length === 0) {
    return (
      <div className="text-center py-8">
        <Users2Icon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-medium mb-1">No Client Relationships</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {agencyName} doesn't have any mapped client relationships yet.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {agencyClients.map(({ relationship, client }) => (
          <Card key={relationship.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{client?.name || 'Unknown Client'}</h4>
                  {client?.website && (
                    <a 
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {client.website}
                    </a>
                  )}
                </div>
                <Badge>{relationship.relationship_type || 'portfolio'}</Badge>
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                  Source: {relationship.source || 'Unknown'}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  {relationship.discovered_at 
                    ? `Discovered: ${format(parseISO(relationship.discovered_at), 'PP')}` 
                    : 'Recently discovered'}
                </div>
                
                <div className="flex items-center text-muted-foreground col-span-2">
                  <Building2Icon className="h-3.5 w-3.5 mr-1.5" />
                  {client?.industry || 'Unknown industry'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RelationshipsList;
