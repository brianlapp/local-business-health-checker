
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalGenerator } from '@/components/outreach/proposal';
import { Business } from '@/types/business';
import { Opportunity, OpportunityContact } from '@/types/opportunity';
import { ensureBusinessStatus } from '@/services/businessUtilsService';
import { Json } from '@/integrations/supabase/types';

const OutreachManager: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTarget, setSelectedTarget] = useState<Business | Opportunity | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (businessesError) {
          throw businessesError;
        }
        
        // Fetch opportunities
        const { data: opportunitiesData, error: opportunitiesError } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (opportunitiesError) {
          throw opportunitiesError;
        }
        
        // Convert database records to proper Business and Opportunity types
        const typedBusinesses: Business[] = businessesData.map(business => ensureBusinessStatus(business));
        setBusinesses(typedBusinesses);
        
        // Convert and set opportunities, ensuring they match the required type
        const typedOpportunities: Opportunity[] = opportunitiesData.map(opp => ({
          ...opp,
          source: (opp.source as any) || 'other', // Ensure it's a valid enum value
          status: (opp.status as any) || 'new',   // Ensure it's a valid enum value
          // Properly cast the contact_info JSON field to OpportunityContact type
          contact_info: opp.contact_info ? (opp.contact_info as unknown as OpportunityContact) : undefined
        }));
        setOpportunities(typedOpportunities);
        
        // Set default selected target if available
        if (typedBusinesses.length > 0) {
          setSelectedTarget(typedBusinesses[0]);
        } else if (typedOpportunities.length > 0) {
          setSelectedTarget(typedOpportunities[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Outreach Manager</h1>
      
      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="proposals">Generate Proposals</TabsTrigger>
          <TabsTrigger value="emails">Email Outreach</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-up Management</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalGenerator 
                businesses={businesses} 
                opportunities={opportunities} 
                selectedTarget={selectedTarget}
                onSelectTarget={setSelectedTarget}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Email Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The email outreach feature is coming soon. You'll be able to create, schedule, and track email campaigns from here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="follow-ups">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The follow-up management feature is coming soon. You'll be able to set up automated follow-ups and track responses.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The templates manager feature is coming soon. You'll be able to create, edit, and organize email and proposal templates here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutreachManager;
