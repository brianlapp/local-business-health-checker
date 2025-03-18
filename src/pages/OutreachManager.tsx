
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Mail, Clock, Filter, Plus } from 'lucide-react';
import ProposalGenerator from '@/components/outreach/ProposalGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import EmailGenerator from '@/components/business/EmailGenerator';

const OutreachManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('proposals');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Business | Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch businesses
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (businessError) throw businessError;
      
      // Fetch opportunities
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (opportunityError) throw opportunityError;
      
      setBusinesses(businessData || []);
      setOpportunities(opportunityData || []);
      
      // Select the first business as default if available
      if (businessData && businessData.length > 0) {
        setSelectedEntity(businessData[0]);
      } else if (opportunityData && opportunityData.length > 0) {
        setSelectedEntity(opportunityData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter entities based on search query
  const filteredBusinesses = businesses.filter(business => 
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (business.website && business.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredOpportunities = opportunities.filter(opportunity => 
    opportunity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine if the selected entity is a business
  const isSelectedBusiness = selectedEntity && 'name' in selectedEntity && !('title' in selectedEntity);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Outreach Manager</h1>
        <p className="text-muted-foreground mt-2">
          Create proposals and manage outreach communications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Entities list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses or opportunities..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="businesses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="businesses" className="mt-0">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex justify-between items-center">
                    <span>Businesses ({filteredBusinesses.length})</span>
                    <Button variant="outline" size="sm">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((business) => (
                        <div
                          key={business.id}
                          className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                            selectedEntity?.id === business.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedEntity(business)}
                        >
                          <div className="font-medium">{business.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {business.website || 'No website'}
                          </div>
                          {business.score !== undefined && (
                            <div className="text-xs mt-1">
                              Score: <span className={business.score > 50 ? 'text-amber-500' : 'text-green-500'}>
                                {business.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No businesses found
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="opportunities" className="mt-0">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm flex justify-between items-center">
                    <span>Opportunities ({filteredOpportunities.length})</span>
                    <Button variant="outline" size="sm">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {filteredOpportunities.length > 0 ? (
                      filteredOpportunities.map((opportunity) => (
                        <div
                          key={opportunity.id}
                          className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                            selectedEntity?.id === opportunity.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedEntity(opportunity)}
                        >
                          <div className="font-medium">{opportunity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {opportunity.client_name || 'Unknown client'}
                          </div>
                          {opportunity.status && (
                            <div className="text-xs mt-1 flex items-center">
                              Status: <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {opportunity.status}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No opportunities found
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2">
          {selectedEntity ? (
            <>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>
                    {isSelectedBusiness ? 
                      (selectedEntity as Business).name : 
                      (selectedEntity as Opportunity).title}
                  </CardTitle>
                  <CardDescription>
                    {isSelectedBusiness ? 
                      `Website: ${(selectedEntity as Business).website || 'Not available'}` : 
                      `Client: ${(selectedEntity as Opportunity).client_name || 'Unknown'}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    variant={activeTab === 'proposals' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('proposals')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Proposal
                  </Button>
                  <Button
                    variant={activeTab === 'emails' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('emails')}
                    disabled={!isSelectedBusiness}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant={activeTab === 'follow-ups' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('follow-ups')}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Follow-ups
                  </Button>
                </CardContent>
              </Card>

              {activeTab === 'proposals' && (
                <ProposalGenerator target={selectedEntity} />
              )}
              
              {activeTab === 'emails' && isSelectedBusiness && (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Outreach</CardTitle>
                    <CardDescription>
                      Create and manage email communications for {(selectedEntity as Business).name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <EmailGenerator business={selectedEntity as Business} />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'follow-ups' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Follow-up Schedule</CardTitle>
                    <CardDescription>
                      Schedule and manage follow-up communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No follow-ups scheduled yet</p>
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Follow-up
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Select a business or opportunity to start
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutreachManager;
