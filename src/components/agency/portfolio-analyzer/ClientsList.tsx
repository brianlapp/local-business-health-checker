
import React from 'react';
import { Business } from '@/types/business';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ClientCard from './ClientCard';

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
          <ClientCard
            key={index}
            client={client}
            isAddedToOpportunities={addedClients.has(client.id)}
            isAddedToRelationships={addedToRelationships.has(client.id)}
            onAddToOpportunities={onAddClient}
            onMapRelationship={() => onMapRelationship(client.id)}
            agencyId={agencyId}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ClientsList;
