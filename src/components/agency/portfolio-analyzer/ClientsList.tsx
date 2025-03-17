
import React from 'react';
import { Business } from '@/types/business';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Globe, ExternalLink, Network, Plus } from 'lucide-react';

interface ClientsListProps {
  clients: Business[];
  addedClients: Set<string>;
  addedToRelationships: Set<string>;
  onAddClient: (client: Business) => void;
  onMapRelationship: (clientId: string) => void;
  agencyId?: string;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  addedClients,
  addedToRelationships,
  onAddClient,
  onMapRelationship,
  agencyId
}) => {
  if (clients.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No clients found</AlertTitle>
        <AlertDescription>
          No client information found. The agency may not have a public client list or portfolio.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {clients.map((client, index) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                {client.website && (
                  <a 
                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 flex items-center mt-1"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {client.website}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {client.source?.replace('agency-portfolio', 'portfolio')}
                  </Badge>
                  
                  {agencyId && addedToRelationships.has(client.id) && (
                    <Badge variant="secondary" className="text-xs">
                      <Network className="w-3 h-3 mr-1" />
                      Relationship Mapped
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {agencyId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMapRelationship(client.id)}
                    disabled={addedToRelationships.has(client.id)}
                  >
                    {addedToRelationships.has(client.id) ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Mapped
                      </>
                    ) : (
                      <>
                        <Network className="w-3 h-3 mr-1" />
                        Map
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  size="sm"
                  variant={addedClients.has(client.id) ? "outline" : "default"}
                  onClick={() => onAddClient(client)}
                  disabled={addedClients.has(client.id)}
                >
                  {addedClients.has(client.id) ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ClientsList;
