
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgencyPortfolioAnalyzer from '@/components/agency/AgencyPortfolioAnalyzer';
import { findAgencies, addAgency } from '@/services/businessService';
import { Business } from '@/types/business';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const AgencyAnalysis = () => {
  const [location, setLocation] = useState('');
  const [agencies, setAgencies] = useState<Business[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Business | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Please enter a location');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const foundAgencies = await findAgencies(location);
      setAgencies(foundAgencies);
      
      if (foundAgencies.length === 0) {
        toast.warning('No agencies found in this location');
      } else {
        toast.success(`Found ${foundAgencies.length} potential agencies`);
      }
    } catch (error) {
      console.error('Error finding agencies:', error);
      toast.error('Failed to find agencies');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAgency = async (agency: Business) => {
    try {
      const success = await addAgency(agency);
      if (success) {
        toast.success(`Added ${agency.name} to database`);
      } else {
        toast.error(`Failed to add ${agency.name}`);
      }
    } catch (error) {
      console.error('Error adding agency:', error);
      toast.error('Failed to add agency');
    }
  };

  const handleSelectAgency = (agency: Business) => {
    setSelectedAgency(agency);
  };

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-3xl font-bold mb-6">Agency Analysis</h1>
      
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search Agencies</TabsTrigger>
          <TabsTrigger value="analyze">Portfolio Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Find Agencies</CardTitle>
              <CardDescription>
                Search for digital agencies in specific locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter location (city, state)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1"
                    disabled={isSearching}
                  />
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                {agencies.length > 0 ? (
                  <div className="space-y-4">
                    {agencies.map((agency) => (
                      <Card key={agency.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{agency.name}</h3>
                            {agency.website && (
                              <a
                                href={`https://${agency.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500"
                              >
                                {agency.website}
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSelectAgency(agency)}
                            >
                              Analyze Portfolio
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddAgency(agency)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="text-center p-6 text-muted-foreground">
                      No agencies found. Try searching for a different location.
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyze">
          <AgencyPortfolioAnalyzer />
        </TabsContent>
      </Tabs>
      
      {selectedAgency && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Analyzing: {selectedAgency.name}</CardTitle>
              {selectedAgency.website && (
                <CardDescription>
                  <a
                    href={`https://${selectedAgency.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {selectedAgency.website}
                  </a>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <AgencyPortfolioAnalyzer />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgencyAnalysis;
