
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlayIcon, PauseIcon, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Business } from '@/types/business';
import { getBusinesses, evaluateOpportunities } from '@/services/businessService';
import { toast } from 'sonner';

const BatchOpportunityScoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [scoredCount, setScoredCount] = useState(0);
  const [needScoringCount, setNeedScoringCount] = useState(0);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getBusinesses();
      setBusinesses(data || []);
      
      // Count businesses without opportunity scores
      const needScoring = data.filter(b => 
        b.website && 
        (!b.opportunityScore && !b.opportunity_score && (b.lighthouseScore || b.lighthouse_score))
      );
      setNeedScoringCount(needScoring.length);
      
      // Count already scored businesses
      const scored = data.filter(b => 
        b.opportunityScore !== undefined || 
        b.opportunity_score !== undefined
      );
      setScoredCount(scored.length);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleBatchScore = async () => {
    setProcessing(true);
    try {
      // Find businesses that need scoring
      const businessesToScore = businesses.filter(b => 
        b.website && 
        (!b.opportunityScore && !b.opportunity_score && (b.lighthouseScore || b.lighthouse_score))
      );
      
      if (businessesToScore.length === 0) {
        toast.info('No businesses need scoring');
        return;
      }
      
      toast.info(`Scoring ${businessesToScore.length} businesses...`);
      
      // Process in batches of 5 to avoid overwhelming the system
      const batchSize = 5;
      let processed = 0;
      
      for (let i = 0; i < businessesToScore.length; i += batchSize) {
        const batch = businessesToScore.slice(i, i + batchSize);
        // Pass both businessIds and a callback to refresh after scoring
        await evaluateOpportunities(batch.map(b => b.id), fetchBusinesses);
        processed += batch.length;
        
        // Update progress
        toast.success(`Processed ${processed} of ${businessesToScore.length} businesses`);
        
        // Add small delay between batches
        if (i + batchSize < businessesToScore.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Refresh business data after scoring
      await fetchBusinesses();
      
      toast.success('Batch scoring complete!');
    } catch (error) {
      console.error('Error scoring businesses:', error);
      toast.error('Failed to complete batch scoring');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Opportunity Scoring</CardTitle>
        <CardDescription>
          Score businesses based on their website quality and potential opportunity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-[250px]" />
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-5 w-[300px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-md p-4 text-center">
                  <p className="text-2xl font-bold">{needScoringCount}</p>
                  <p className="text-sm text-muted-foreground">Need Scoring</p>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <p className="text-2xl font-bold">{scoredCount}</p>
                  <p className="text-sm text-muted-foreground">Scored</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Requirements for Opportunity Scoring</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Businesses must have a valid website URL</li>
                  <li>Performance data (Lighthouse score) must be available</li>
                  <li>At least one scan must have been completed</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Scoring Process</h3>
                <p className="text-sm text-muted-foreground">
                  The system evaluates each business based on their website performance,
                  mobile-friendliness, CMS, and other factors to determine
                  potential improvement opportunities.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleBatchScore} 
          disabled={processing || loading || needScoringCount === 0}
          className="w-full"
        >
          {processing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Score {needScoringCount} Businesses
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BatchOpportunityScoring;
