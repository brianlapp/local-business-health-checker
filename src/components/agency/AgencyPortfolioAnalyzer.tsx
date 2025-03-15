import React, { useState } from 'react';
import { analyzeAgencyPortfolio } from '@/services/businessService';
import { addAgencyClientsRelationships } from '@/services/discovery/agency/agencyRelationshipService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { 
  Loader2, 
  ExternalLink, 
  Plus, 
  Globe, 
  AlertCircle, 
  Check, 
  Info,
  Network
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgencyPortfolioAnalyzerProps {
  onAddClient?: (client: Business) => void;
  agencyWebsite?: string;
  agencyId?: string;
}

const AgencyPortfolioAnalyzer: React.FC<AgencyPortfolioAnalyzerProps> = ({ 
  onAddClient, 
  agencyWebsite = '',
  agencyId
}) => {
  const [websiteUrl, setWebsiteUrl] = useState(agencyWebsite);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    clients: Business[];
    portfolioLinks: string[];
    requestUrl?: string;
    error?: string;
  } | null>(null);
  const [addedClients, setAddedClients] = useState<Set<string>>(new Set());
  const [addedToRelationships, setAddedToRelationships] = useState<Set<string>>(new Set());

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      toast.error('Please enter an agency website URL');
      return;
    }
    
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const portfolioResults = await analyzeAgencyPortfolio(websiteUrl);
      setResults(portfolioResults);
      
      if (portfolioResults.error) {
        toast.error(`Analysis error: ${portfolioResults.error}`);
      } else if (portfolioResults.clients.length === 0) {
        toast.warning('No client information found');
      } else {
        toast.success(`Found ${portfolioResults.clients.length} potential clients`);
      }
    } catch (error) {
      console.error('Error analyzing agency portfolio:', error);
      toast.error('Failed to analyze agency portfolio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddClient = (client: Business) => {
    if (onAddClient) {
      onAddClient(client);
      setAddedClients(prev => new Set(prev).add(client.id));
      toast.success(`Added ${client.name} to opportunities`);
    }
  };

  const handleAddAllClients = () => {
    if (!results?.clients.length || !onAddClient) return;
    
    results.clients.forEach(client => {
      if (!addedClients.has(client.id)) {
        onAddClient(client);
        setAddedClients(prev => new Set(prev).add(client.id));
      }
    });
    
    toast.success(`Added ${results.clients.length} clients to opportunities`);
  };

  const handleMapRelationships = async () => {
    if (!agencyId || !results?.clients.length) {
      toast.error('Agency ID is required to map relationships');
      return;
    }
    
    const clientIds = results.clients
      .filter(client => !addedToRelationships.has(client.id))
      .map(client => client.id);
    
    if (clientIds.length === 0) {
      toast.info('All clients are already mapped to this agency');
      return;
    }
    
    try {
      const { success, failed } = await addAgencyClientsRelationships(
        agencyId,
        clientIds,
        'portfolio',
        'portfolio-analysis'
      );
      
      if (success > 0) {
        const newAddedSet = new Set(addedToRelationships);
        clientIds.forEach(id => newAddedSet.add(id));
        setAddedToRelationships(newAddedSet);
        
        toast.success(`Mapped ${success} clients to this agency`);
      }
      
      if (failed > 0) {
        toast.warning(`Failed to map ${failed} clients`);
      }
    } catch (error) {
      console.error('Error mapping relationships:', error);
      toast.error('Failed to map client relationships');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agency Portfolio Analyzer</CardTitle>
        <CardDescription>
          Extract client information from agency websites to find potential opportunities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter agency website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="flex-1"
              disabled={isAnalyzing}
            />
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </div>
        </form>

        {results && (
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
                    onClick={handleMapRelationships}
                    disabled={results.clients.every(client => addedToRelationships.has(client.id))}
                  >
                    <Network className="w-4 h-4 mr-1" />
                    Map Relationships
                  </Button>
                )}
                
                {results.clients.length > 0 && onAddClient && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleAddAllClients}
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
                {results.clients.length === 0 ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No clients found</AlertTitle>
                    <AlertDescription>
                      No client information found. The agency may not have a public client list or portfolio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {results.clients.map((client, index) => (
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
                                  onClick={() => handleMapRelationships()}
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
                              
                              {onAddClient && (
                                <Button 
                                  size="sm"
                                  variant={addedClients.has(client.id) ? "outline" : "default"}
                                  onClick={() => handleAddClient(client)}
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
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="links" className="mt-4">
                {results.portfolioLinks.length === 0 ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No portfolio pages found</AlertTitle>
                    <AlertDescription>
                      No portfolio pages found. The agency may not have a portfolio section on their website.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {results.portfolioLinks.map((link, index) => (
                        <a 
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 rounded border hover:bg-muted flex items-center"
                        >
                          {link}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="debug" className="mt-4">
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Analysis Information</AlertTitle>
                  <AlertDescription>
                    Details about the agency portfolio analysis process.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Request URL</h3>
                    <p className="text-sm text-muted-foreground">
                      {results.requestUrl || 'No request URL available'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {results.error ? (
                        <span className="text-destructive">{results.error}</span>
                      ) : (
                        <span className="text-green-500">Analysis successful</span>
                      )}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Client Sources</h3>
                    {results.clients.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(results.clients.map(c => c.source))).map((source, i) => (
                          <Badge key={i} variant="outline">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No clients found</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyPortfolioAnalyzer;
