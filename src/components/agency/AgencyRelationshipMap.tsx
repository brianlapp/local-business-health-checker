
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ExternalLink, Building, Users, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { 
  getRelationshipMapData, 
  findCompetitorAgencies,
  AgencyClientRelationship
} from '@/services/discovery/agency/agencyRelationshipService';

const AgencyRelationshipMap: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState<{
    agencies: Business[];
    clients: Business[];
    relationships: AgencyClientRelationship[];
  } | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Business[]>([]);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);

  useEffect(() => {
    loadRelationshipData();
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      loadCompetitors(selectedAgency);
    }
  }, [selectedAgency]);

  const loadRelationshipData = async () => {
    setIsLoading(true);
    try {
      const data = await getRelationshipMapData();
      setMapData(data);
      
      if (data.agencies.length > 0) {
        setSelectedAgency(data.agencies[0].id);
      }
    } catch (error) {
      console.error('Error loading relationship data:', error);
      toast.error('Failed to load agency relationship data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetitors = async (agencyId: string) => {
    setIsLoadingCompetitors(true);
    try {
      const competitorsList = await findCompetitorAgencies(agencyId);
      setCompetitors(competitorsList);
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast.error('Failed to load competitor information');
    } finally {
      setIsLoadingCompetitors(false);
    }
  };

  const getAgencyClients = (agencyId: string): Business[] => {
    if (!mapData) return [];
    
    // Find all relationships for this agency
    const agencyRelationships = mapData.relationships.filter(rel => rel.agency_id === agencyId);
    
    // Get the client IDs from these relationships
    const clientIds = agencyRelationships.map(rel => rel.client_id);
    
    // Return the client details for these IDs
    return mapData.clients.filter(client => clientIds.includes(client.id));
  };

  const handleSelectAgency = (agencyId: string) => {
    setSelectedAgency(agencyId);
  };

  const getSelectedAgency = (): Business | null => {
    if (!mapData || !selectedAgency) return null;
    return mapData.agencies.find(agency => agency.id === selectedAgency) || null;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-80">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-muted-foreground">Loading relationship data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mapData || mapData.agencies.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center p-8">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Agency Relationships Found</h3>
            <p className="text-muted-foreground mb-4">
              There are no agency-client relationships mapped yet. Add agencies and analyze their portfolios to start building the relationship map.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedAgencyData = getSelectedAgency();
  const clients = selectedAgency ? getAgencyClients(selectedAgency) : [];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Agencies
            </CardTitle>
            <CardDescription>
              Select an agency to view its relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {mapData.agencies.map(agency => (
                  <Button
                    key={agency.id}
                    variant={selectedAgency === agency.id ? "default" : "outline"}
                    className="w-full justify-start text-left"
                    onClick={() => handleSelectAgency(agency.id)}
                  >
                    <div className="truncate">
                      {agency.name}
                      <Badge className="ml-2" variant="outline">
                        {getAgencyClients(agency.id).length} clients
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedAgencyData ? selectedAgencyData.name : 'Agency'} Relationships
            </CardTitle>
            {selectedAgencyData && selectedAgencyData.website && (
              <CardDescription>
                <a
                  href={`https://${selectedAgencyData.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 flex items-center"
                >
                  {selectedAgencyData.website}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="clients">
              <TabsList className="mb-4">
                <TabsTrigger value="clients" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Clients ({clients.length})
                </TabsTrigger>
                <TabsTrigger value="competitors" className="flex items-center">
                  <Share2 className="w-4 h-4 mr-2" />
                  Competitors ({competitors.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients">
                {clients.length > 0 ? (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                      {clients.map(client => (
                        <Card key={client.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{client.name}</h3>
                              {client.website && (
                                <a
                                  href={`https://${client.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 flex items-center"
                                >
                                  {client.website}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {client.industry || 'Business'}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p>No clients found for this agency.</p>
                    <p className="text-sm">Analyze their portfolio to discover clients.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="competitors">
                {isLoadingCompetitors ? (
                  <div className="flex justify-center items-center h-[350px]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : competitors.length > 0 ? (
                  <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-4">
                      {competitors.map(competitor => (
                        <Card key={competitor.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{competitor.name}</h3>
                              {competitor.website && (
                                <a
                                  href={`https://${competitor.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 flex items-center"
                                >
                                  {competitor.website}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSelectAgency(competitor.id)}
                            >
                              View Details
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <Share2 className="w-8 h-8 mx-auto mb-2" />
                    <p>No competing agencies found.</p>
                    <p className="text-sm">Competitors are agencies that share clients with this agency.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyRelationshipMap;
