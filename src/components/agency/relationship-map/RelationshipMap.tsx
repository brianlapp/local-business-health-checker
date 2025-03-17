
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InfoIcon, RefreshCw, NetworkIcon, Building2Icon, Users2Icon } from 'lucide-react';
import { Business } from '@/types/business';
import { getRelationshipMapData, AgencyClientRelationship, findCompetitorAgencies } from '@/services/discovery/agency/agencyRelationshipService';
import { toast } from 'sonner';
import NetworkGraph from './NetworkGraph';
import RelationshipsList from './RelationshipsList';
import CompetitorsList from './CompetitorsList';

/**
 * Component to display and visualize relationships between agencies and clients
 */
const RelationshipMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agencies, setAgencies] = useState<Business[]>([]);
  const [clients, setClients] = useState<Business[]>([]);
  const [relationships, setRelationships] = useState<AgencyClientRelationship[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Business[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);

  // Load relationship data
  const loadRelationshipData = async () => {
    setLoading(true);
    try {
      const data = await getRelationshipMapData();
      setAgencies(data.agencies);
      setClients(data.clients);
      setRelationships(data.relationships);
      
      // Set first agency as selected if none is selected and there are agencies
      if (!selectedAgency && data.agencies.length > 0) {
        setSelectedAgency(data.agencies[0].id);
        loadCompetitors(data.agencies[0].id);
      }
    } catch (error) {
      console.error('Error loading relationship data:', error);
      toast.error('Failed to load relationship data');
    } finally {
      setLoading(false);
    }
  };

  // Load competitors for a specific agency
  const loadCompetitors = async (agencyId: string) => {
    if (!agencyId) return;
    
    setCompetitorsLoading(true);
    try {
      const competitorsList = await findCompetitorAgencies(agencyId);
      setCompetitors(competitorsList);
    } catch (error) {
      console.error('Error loading competitors:', error);
      toast.error('Failed to load competitors');
    } finally {
      setCompetitorsLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRelationshipData();
    setRefreshing(false);
  };

  // Handle agency selection
  const handleAgencySelect = (agencyId: string) => {
    setSelectedAgency(agencyId);
    loadCompetitors(agencyId);
  };

  // Load data on initial render
  useEffect(() => {
    loadRelationshipData();
  }, []);

  // Get current agency's client relationships
  const getAgencyClients = () => {
    if (!selectedAgency) return [];
    
    const agencyRelationships = relationships.filter(rel => rel.agency_id === selectedAgency);
    return agencyRelationships.map(rel => {
      const client = clients.find(c => c.id === rel.client_id);
      return { relationship: rel, client };
    }).filter(item => item.client); // Filter out any undefined clients
  };

  // Get current agency name
  const getCurrentAgencyName = () => {
    if (!selectedAgency) return 'No Agency Selected';
    const agency = agencies.find(a => a.id === selectedAgency);
    return agency ? agency.name : 'Unknown Agency';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <NetworkIcon className="mr-2 h-5 w-5" />
              Agency-Client Relationship Map
            </CardTitle>
            <CardDescription>
              Visualize and analyze agency-client relationships
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-12">
            <Building2Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Agency Data Found</h3>
            <p className="text-muted-foreground mb-6">
              Start by analyzing agency portfolios to discover client relationships
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/agency-analysis'}>
              Analyze Agency Portfolios
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {agencies.map(agency => (
                <Badge 
                  key={agency.id}
                  variant={selectedAgency === agency.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleAgencySelect(agency.id)}
                >
                  {agency.name}
                </Badge>
              ))}
            </div>
            
            <Separator />
            
            <div className="font-medium text-lg flex items-center">
              <Building2Icon className="mr-2 h-5 w-5" />
              {getCurrentAgencyName()}
            </div>
            
            <Tabs defaultValue="graph" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="graph">Network Graph</TabsTrigger>
                <TabsTrigger value="clients">Client List</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="graph">
                <div className="border rounded-md h-[400px] p-4">
                  <NetworkGraph 
                    agencies={agencies}
                    clients={clients}
                    relationships={relationships}
                    selectedAgencyId={selectedAgency}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="clients">
                <RelationshipsList 
                  agencyClients={getAgencyClients()}
                  agencyName={getCurrentAgencyName()}
                />
              </TabsContent>
              
              <TabsContent value="competitors">
                <CompetitorsList 
                  competitors={competitors}
                  loading={competitorsLoading}
                  agencyName={getCurrentAgencyName()}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelationshipMap;
