
import React, { useState } from 'react';
import { Business } from '@/types/business';
import AnalysisForm from './portfolio-analyzer/AnalysisForm';
import AnalysisResults from './portfolio-analyzer/AnalysisResults';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { analyzeAgencyPortfolio } from '@/services/businessService';
import { addBulkClientsToAgencyPortfolio } from '@/services/discovery/agency/agencyRelationshipService';
import { toast } from 'sonner';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    clients: Business[];
    portfolioLinks: string[];
    requestUrl?: string;
    error?: string;
  } | null>(null);
  const [addedClients, setAddedClients] = useState<Set<string>>(new Set());
  const [addedToRelationships, setAddedToRelationships] = useState<Set<string>>(new Set());

  const handleAnalyze = async (websiteUrl: string) => {
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
      const { success, failed } = await addBulkClientsToAgencyPortfolio(
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

  const handleMapSingleRelationship = async (clientId: string) => {
    if (!agencyId) {
      toast.error('Agency ID is required to map relationships');
      return;
    }
    
    if (addedToRelationships.has(clientId)) {
      toast.info('This client is already mapped to this agency');
      return;
    }
    
    try {
      const { success } = await addBulkClientsToAgencyPortfolio(
        agencyId,
        [clientId],
        'portfolio',
        'portfolio-analysis'
      );
      
      if (success > 0) {
        setAddedToRelationships(prev => new Set(prev).add(clientId));
        toast.success('Client mapped to agency successfully');
      } else {
        toast.error('Failed to map client to agency');
      }
    } catch (error) {
      console.error('Error mapping relationship:', error);
      toast.error('Failed to map client relationship');
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
        <AnalysisForm
          initialWebsite={agencyWebsite}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
        />

        {results && (
          <AnalysisResults
            results={results}
            addedClients={addedClients}
            addedToRelationships={addedToRelationships}
            onAddClient={handleAddClient}
            onAddAllClients={handleAddAllClients}
            onMapRelationships={handleMapRelationships}
            onMapSingleRelationship={handleMapSingleRelationship}
            agencyId={agencyId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AgencyPortfolioAnalyzer;
