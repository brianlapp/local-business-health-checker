
import React, { useState, useEffect } from 'react';
import { getAllRelationships } from '@/services/discovery/agency/agencyRelationshipService';
import { Business } from '@/types/business';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, ExternalLink, Users, Building, Network } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AgencyClientRelationship {
  id?: string;
  agency_id: string;
  client_id: string;
  relationship_type?: string;
  source?: string;
}

const AgencyRelationshipMap = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<AgencyClientRelationship[]>([]);
  const [agencies, setAgencies] = useState<Business[]>([]);
  const [clients, setClients] = useState<Business[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRelationships();
      setAgencies(data.agencies);
      setClients(data.clients);
      setRelationships(data.relationships);
      
      if (data.agencies.length > 0 && !selectedAgency) {
        setSelectedAgency(data.agencies[0].id);
      }
      
      if (data.relationships.length === 0) {
        toast({
          title: "No relationships found",
          description: "No agency-client relationships have been discovered yet.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading relationships:', error);
      toast({
        title: "Error loading relationships",
        description: "Failed to load agency-client relationships.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAgencyClients = (agencyId: string) => {
    return relationships
      .filter(rel => rel.agency_id === agencyId)
      .map(rel => clients.find(c => c.id === rel.client_id))
      .filter(Boolean) as Business[];
  };

  const getClientAgencies = (clientId: string) => {
    return relationships
      .filter(rel => rel.client_id === clientId)
      .map(rel => agencies.find(a => a.id === rel.agency_id))
      .filter(Boolean) as Business[];
  };

  const getAgencyById = (id: string) => {
    return agencies.find(a => a.id === id);
  };

  // Get competitor agencies that share clients with the selected agency
  const getCompetitors = (agencyId: string) => {
    // Get all clients of this agency
    const agencyClients = getAgencyClients(agencyId).map(c => c.id);
    
    // Find other agencies that have these clients
    const competitors = new Map<string, {agency: Business, sharedClients: Business[]}>();
    
    agencyClients.forEach(clientId => {
      const clientAgencies = getClientAgencies(clientId)
        .filter(a => a.id !== agencyId);
      
      clientAgencies.forEach(agency => {
        if (!competitors.has(agency.id)) {
          competitors.set(agency.id, {
            agency,
            sharedClients: []
          });
        }
        
        const competitor = competitors.get(agency.id);
        if (competitor) {
          const client = clients.find(c => c.id === clientId);
          if (client) {
            competitor.sharedClients.push(client);
          }
        }
      });
    });
    
    return Array.from(competitors.values())
      .sort((a, b) => b.sharedClients.length - a.sharedClients.length);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Network className="mr-2 h-5 w-5" />
          Agency Relationship Map
        </CardTitle>
        <CardDescription>
          Visualize relationships between agencies and their clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : relationships.length === 0 ? (
          <div className="text-center p-12 border rounded-md bg-muted/20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No relationships found</h3>
            <p className="text-muted-foreground mt-2">
              Start analyzing agency portfolios to discover relationships.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  Agencies ({agencies.length})
                </h3>
                <ScrollArea className="h-[200px] pr-4 border rounded-md p-2">
                  <div className="space-y-2">
                    {agencies.map(agency => (
                      <div 
                        key={agency.id}
                        onClick={() => setSelectedAgency(agency.id)}
                        className={`
                          p-2 rounded-md cursor-pointer 
                          ${selectedAgency === agency.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50'}
                        `}
                      >
                        <div className="font-medium">{agency.name}</div>
                        {agency.website && (
                          <a 
                            href={`https://${agency.website}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 flex items-center mt-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            {agency.website}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getAgencyClients(agency.id).length} clients
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {selectedAgency && (
                <div className="w-full sm:w-2/3">
                  <h3 className="text-sm font-medium mb-2">
                    {getAgencyById(selectedAgency)?.name} Relationships
                  </h3>
                  <Tabs defaultValue="clients">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="clients" className="flex-1">
                        Clients ({getAgencyClients(selectedAgency).length})
                      </TabsTrigger>
                      <TabsTrigger value="competitors" className="flex-1">
                        Competitors ({getCompetitors(selectedAgency).length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="clients">
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {getAgencyClients(selectedAgency).map(client => (
                            <div key={client.id} className="p-3 border rounded-md">
                              <div className="font-medium">{client.name}</div>
                              {client.website && (
                                <a 
                                  href={`https://${client.website}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 flex items-center mt-1"
                                >
                                  <Globe className="h-3 w-3 mr-1" />
                                  {client.website}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                              {getClientAgencies(client.id).length > 1 && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Used by {getClientAgencies(client.id).length} agencies
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="competitors">
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                          {getCompetitors(selectedAgency).map(competitor => (
                            <div key={competitor.agency.id} className="p-3 border rounded-md">
                              <div className="font-medium">
                                {competitor.agency.name}
                                <Badge variant="secondary" className="ml-2">
                                  {competitor.sharedClients.length} shared clients
                                </Badge>
                              </div>
                              
                              {competitor.agency.website && (
                                <a 
                                  href={`https://${competitor.agency.website}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 flex items-center mt-1"
                                >
                                  <Globe className="h-3 w-3 mr-1" />
                                  {competitor.agency.website}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                              
                              <Separator className="my-2" />
                              
                              <div className="text-sm font-medium mt-2">Shared clients:</div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {competitor.sharedClients.map(client => (
                                  <Badge key={client.id} variant="outline" className="text-xs">
                                    {client.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4" 
              onClick={loadRelationships}
            >
              Refresh Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyRelationshipMap;
