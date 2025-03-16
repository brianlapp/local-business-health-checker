
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Calculator, LightbulbIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { getBusinessesNeedingScoring, processBusinessOpportunityScores } from '@/services/websiteAnalysisService';
import { Business } from '@/types/business';
import { toast } from 'sonner';

const BatchOpportunityScoring: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  
  const handleFetchBusinesses = async () => {
    try {
      setIsProcessing(true);
      const needsScoring = await getBusinessesNeedingScoring();
      setBusinesses(needsScoring);
      setTotalToProcess(needsScoring.length);
      
      if (needsScoring.length === 0) {
        toast.info('No businesses found that need opportunity scoring');
      } else {
        toast.success(`Found ${needsScoring.length} businesses that need opportunity scoring`);
      }
    } catch (error) {
      console.error('Error fetching businesses for scoring:', error);
      toast.error('Failed to fetch businesses for scoring');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleProcessBusinesses = async () => {
    if (businesses.length === 0) {
      toast.error('No businesses to process');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setProcessedCount(0);
      
      // Process businesses in batches of 5
      const batchSize = 5;
      for (let i = 0; i < businesses.length; i += batchSize) {
        const batch = businesses.slice(i, Math.min(i + batchSize, businesses.length));
        await processBusinessOpportunityScores(batch);
        
        // Update progress
        const newProcessedCount = Math.min(i + batchSize, businesses.length);
        setProcessedCount(newProcessedCount);
        setProgress((newProcessedCount / businesses.length) * 100);
      }
      
      toast.success(`Successfully processed opportunity scores for ${businesses.length} businesses`);
      
      // Clear the list after processing
      setBusinesses([]);
    } catch (error) {
      console.error('Error processing business opportunity scores:', error);
      toast.error('Failed to process business opportunity scores');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Opportunity Score Processing
        </CardTitle>
        <CardDescription>
          Calculate opportunity scores for businesses based on website quality
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {businesses.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm">
              Found {businesses.length} businesses that need opportunity scoring.
            </p>
            
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing: {processedCount} of {totalToProcess}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <LightbulbIcon className="h-4 w-4" />
            <AlertTitle>Opportunity Scoring</AlertTitle>
            <AlertDescription>
              This tool will find businesses that need opportunity scores and calculate them based on
              website quality factors like performance, mobile-friendliness, and CMS status.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleFetchBusinesses} 
          disabled={isProcessing}
        >
          Find Businesses
        </Button>
        
        <Button 
          onClick={handleProcessBusinesses} 
          disabled={isProcessing || businesses.length === 0}
        >
          Process Scores
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BatchOpportunityScoring;
