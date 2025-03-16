import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface WebsiteOpportunityScoreProps {
  business: any; // Replace 'any' with your actual Business type
}

interface SEOIssuesResult {
  hasSEOIssues: boolean;
  issueCount: number;
  specificIssues: string[];
}

const WebsiteOpportunityScore: React.FC<WebsiteOpportunityScoreProps> = ({ business }) => {
  const [score, setScore] = useState<number>(business?.opportunity_score || 0);
  const [seoIssues, setSeoIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Simulate calculating the opportunity score
    const calculateScore = async () => {
      setLoading(true);
      // Simulate an API call or complex calculation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random score for demonstration purposes
      const randomScore = Math.floor(Math.random() * 100);
      setScore(randomScore);
      setLoading(false);
    };
    
    calculateScore();
  }, [business?.id]);

  useEffect(() => {
    const calculateSEOIssues = async () => {
      try {
        // This is a placeholder for actual SEO analysis
        // In a real implementation, this would call an API or service to analyze SEO issues
        const result: SEOIssuesResult = {
          hasSEOIssues: true,
          issueCount: 3,
          specificIssues: [
            'Missing meta descriptions',
            'Low keyword density',
            'Duplicate content issues'
          ]
        };
        
        // Set the specific issues array
        setSeoIssues(result.specificIssues);
        
        return result;
      } catch (error) {
        console.error('Error calculating SEO issues:', error);
        return {
          hasSEOIssues: false,
          issueCount: 0,
          specificIssues: []
        };
      }
    };
    
    calculateSEOIssues();
  }, [business?.id]);

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Website Opportunity Score</h3>
        <p className="text-sm text-muted-foreground">
          Evaluate the potential of this website as a client
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-4xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : score}</span>
          <Badge variant="secondary">Potential Score</Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium">SEO Issues</h4>
          {seoIssues.length > 0 ? (
            <ul className="list-disc pl-5 mt-1 text-sm text-muted-foreground">
              {seoIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No significant SEO issues found.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Analyze Website</Button>
      </CardFooter>
    </Card>
  );
};

export default WebsiteOpportunityScore;
