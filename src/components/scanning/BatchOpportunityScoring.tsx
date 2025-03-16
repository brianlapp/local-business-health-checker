
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types/business';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getBusinesses } from '@/services/businessCrudService';
import { evaluateOpportunities } from '@/services/evaluation/opportunityEvaluationService';

const BatchOpportunityScoring: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  
  useEffect(() => {
    loadBusinesses();
  }, []);
  
  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };
  
  const getBusinessesWithoutScores = (): Business[] => {
    return businesses.filter(b => (
      (b.opportunityScore === undefined || b.opportunityScore === null) && 
      (b.opportunity_score === undefined || b.opportunity_score === null)
    ));
  };
  
  const getBusinessesWithScores = (): Business[] => {
    return businesses.filter(b => (
      (b.opportunityScore !== undefined && b.opportunityScore !== null) || 
      (b.opportunity_score !== undefined && b.opportunity_score !== null)
    ));
  };
  
  const getOpportunityScore = (business: Business): number => {
    return business.opportunityScore || business.opportunity_score || 0;
  };
  
  const handleScoreAll = async () => {
    const businessesToScore = getBusinessesWithoutScores();
    
    if (businessesToScore.length === 0) {
      toast.info('All businesses already have opportunity scores');
      return;
    }
    
    setScoring(true);
    toast.loading(`Calculating opportunity scores for ${businessesToScore.length} businesses...`);
    
    try {
      // Convert to business IDs for the evaluation service
      const businessIds = businessesToScore.map(b => b.id);
      
      // Call evaluateOpportunities with the correct signature (passing a callback function)
      await evaluateOpportunities(businessIds, () => {
        // Callback to refresh data once scoring is complete
        loadBusinesses();
        toast.success(`Opportunity scores calculated for ${businessesToScore.length} businesses`);
        setScoring(false);
      });
    } catch (error) {
      console.error('Error scoring businesses:', error);
      toast.error('Failed to calculate opportunity scores');
      setScoring(false);
    }
  };
  
  const formatChartData = () => {
    const businessesWithScores = getBusinessesWithScores();
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };
    
    businessesWithScores.forEach(business => {
      const score = getOpportunityScore(business);
      
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });
    
    return Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count
    }));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Opportunity Scoring</CardTitle>
        <CardDescription>
          Calculate potential value scores for businesses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="stats">
            <TabsList className="mb-4">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="unscored">Unscored ({getBusinessesWithoutScores().length})</TabsTrigger>
            </TabsList>
            <TabsContent value="stats">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData()}>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {getBusinessesWithScores().length} of {businesses.length} businesses have opportunity scores
              </div>
            </TabsContent>
            <TabsContent value="unscored">
              <div className="text-sm">
                {getBusinessesWithoutScores().length === 0 ? (
                  <p>All businesses have been scored! 🎉</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {getBusinessesWithoutScores().slice(0, 5).map(business => (
                      <li key={business.id}>{business.name}</li>
                    ))}
                    {getBusinessesWithoutScores().length > 5 && (
                      <li>...and {getBusinessesWithoutScores().length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScoreAll} 
          disabled={loading || scoring || getBusinessesWithoutScores().length === 0}
          className="w-full"
        >
          {scoring ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Calculating Scores...
            </>
          ) : (
            `Score ${getBusinessesWithoutScores().length} Businesses`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BatchOpportunityScoring;
