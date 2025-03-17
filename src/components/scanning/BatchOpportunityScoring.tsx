
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  RefreshCw,
  Target,
  AlertCircle,
  CheckCircle2,
  Gauge,
  BarChart
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  getBusinessesNeedingScores,
  calculateOpportunityScores,
  OpportunityScore
} from '@/services/scoring/scoreService';

const BatchOpportunityScoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [businesses, setBusinesses] = useState<OpportunityScore[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await getBusinessesNeedingScores();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast.error('Failed to load businesses needing scores');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScores = async () => {
    setCalculating(true);
    setProgress(0);
    
    try {
      // We'll simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 300);
      
      const updatedBusinesses = await calculateOpportunityScores(businesses.map(b => b.id));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success(`Calculated opportunity scores for ${updatedBusinesses.length} businesses`);
      
      // Reload the businesses after a short delay so the progress animation completes
      setTimeout(() => {
        loadBusinesses();
        setCalculating(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error calculating scores:', error);
      toast.error('Failed to calculate opportunity scores');
      setCalculating(false);
      setProgress(0);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Opportunity Scoring
        </CardTitle>
        <CardDescription>
          Calculate opportunity scores for businesses based on scan results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : businesses.length === 0 ? (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>All Caught Up!</AlertTitle>
            <AlertDescription>
              All businesses have been scored. No opportunity scoring needed at this time.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Business Opportunity Scoring</AlertTitle>
              <AlertDescription>
                {businesses.length} businesses need opportunity scores calculated.
                Opportunity scores help you prioritize which businesses to contact.
              </AlertDescription>
            </Alert>
            
            {calculating && (
              <div className="my-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calculating scores...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Website Performance</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead>Opportunity Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.slice(0, 10).map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">
                        {business.name}
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {business.website}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-purple-500" />
                          <span className={getScoreColor(business.lighthouseScore)}>
                            {business.lighthouseScore !== null ? `${business.lighthouseScore}/100` : 'No data'}
                          </span>
                        </div>
                        {business.gtmetrixScore !== null && (
                          <div className="flex items-center gap-2 mt-1">
                            <BarChart className="h-4 w-4 text-blue-500" />
                            <span className={getScoreColor(business.gtmetrixScore)}>
                              {business.gtmetrixScore}/100
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {business.lastChecked ? 
                          format(new Date(business.lastChecked), 'MMM d, yyyy') : 
                          'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className={`text-lg font-bold ${getScoreColor(business.opportunityScore)}`}>
                          {business.opportunityScore !== null ? 
                            `${business.opportunityScore}/100` : 
                            '—'
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {businesses.length > 10 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Showing 10 of {businesses.length} businesses
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleCalculateScores}
          disabled={loading || calculating || businesses.length === 0}
        >
          {calculating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Calculate Opportunity Scores
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BatchOpportunityScoring;
