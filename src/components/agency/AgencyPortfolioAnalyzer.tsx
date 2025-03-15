
import React, { useState } from 'react';
import { analyzeAgencyPortfolio } from '@/services/businessService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { Loader2, ExternalLink } from 'lucide-react';

interface AgencyPortfolioAnalyzerProps {
  onAddClient?: (client: Business) => void;
}

const AgencyPortfolioAnalyzer: React.FC<AgencyPortfolioAnalyzerProps> = ({ onAddClient }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    clients: Business[];
    portfolioLinks: string[];
    requestUrl?: string;
    error?: string;
  } | null>(null);

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
      toast.success(`Added ${client.name} to opportunities`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agency Portfolio Analyzer</CardTitle>
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
            <Tabs defaultValue="clients">
              <TabsList className="w-full">
                <TabsTrigger value="clients" className="flex-1">
                  Clients ({results.clients.length})
                </TabsTrigger>
                <TabsTrigger value="links" className="flex-1">
                  Portfolio Links ({results.portfolioLinks.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients" className="mt-4">
                {results.clients.length === 0 ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      No client information found. The agency may not have a public client list or portfolio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {results.clients.map((client, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{client.name}</h3>
                            {client.website && (
                              <a 
                                href={client.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 flex items-center mt-1"
                              >
                                {client.website}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddClient(client)}
                          >
                            Add as Opportunity
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="links" className="mt-4">
                {results.portfolioLinks.length === 0 ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      No portfolio pages found. The agency may not have a portfolio section on their website.
                    </AlertDescription>
                  </Alert>
                ) : (
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
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyPortfolioAnalyzer;
