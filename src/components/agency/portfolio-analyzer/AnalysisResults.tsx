
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types/business';
import { Network, Plus } from 'lucide-react';
import ClientsList from './ClientsList';
import PortfolioLinks from './PortfolioLinks';
import DebugInfo from './DebugInfo';

interface AnalysisResultsProps {
  results: {
    clients: Business[];
    portfolioLinks: string[];
    requestUrl?: string;
    error?: string;
  };
  addedClients: Set<string>;
  addedToRelationships: Set<string>;
  onAddClient: (client: Business) => void;
  onAddAllClients: () => void;
  onMapRelationships: () => void;
  onMapSingleRelationship: (clientId: string) => void;
  agencyId?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  results,
  addedClients,
  addedToRelationships,
  onAddClient,
  onAddAllClients,
  onMapRelationships,
  onMapSingleRelationship,
  agencyId
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {results.portfolioLinks.length} portfolio pages analyzed
          </Badge>
          {results.clients.length > 0 && (
            <Badge className="ml-2 mb-2">
              {results.clients.length} clients found
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          {results.clients.length > 0 && agencyId && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onMapRelationships}
              disabled={results.clients.every(client => addedToRelationships.has(client.id))}
            >
              <Network className="w-4 h-4 mr-1" />
              Map Relationships
            </Button>
          )}
          
          {results.clients.length > 0 && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={onAddAllClients}
              disabled={results.clients.every(client => addedClients.has(client.id))}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add All Clients
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="clients">
        <TabsList className="w-full">
          <TabsTrigger value="clients" className="flex-1">
            Clients ({results.clients.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="flex-1">
            Portfolio Links ({results.portfolioLinks.length})
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex-1">
            Debug Info
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="mt-4">
          <ClientsList
            clients={results.clients}
            addedClients={addedClients}
            addedToRelationships={addedToRelationships}
            onAddClient={onAddClient}
            onMapRelationship={onMapSingleRelationship}
            agencyId={agencyId}
          />
        </TabsContent>
        
        <TabsContent value="links" className="mt-4">
          <PortfolioLinks links={results.portfolioLinks} />
        </TabsContent>
        
        <TabsContent value="debug" className="mt-4">
          <DebugInfo
            requestUrl={results.requestUrl}
            error={results.error}
            clients={results.clients}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisResults;
