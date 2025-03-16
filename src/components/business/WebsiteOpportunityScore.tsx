
import React, { useState } from 'react';
import { Business } from '@/types/business';
import { calculateWebsiteOpportunityScore, calculateSEOIssues } from '@/services/websiteAnalysisService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calculator, RefreshCw } from 'lucide-react';

interface WebsiteOpportunityScoreProps {
  business: Business;
  onScoreUpdated?: (newScore: number) => void;
}

const WebsiteOpportunityScore: React.FC<WebsiteOpportunityScoreProps> = ({ business, onScoreUpdated }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentScore, setCurrentScore] = useState(business.score || 0);
  const [seoIssues, setSeoIssues] = useState<string[]>(() => {
    const issues = calculateSEOIssues(business);
    return issues.specificIssues;
  });
  
  // Determine if we have enough data to calculate a meaningful score
  const hasEnoughData = Boolean(
    business.lighthouse_score || 
    business.lighthouseScore ||
    business.gtmetrix_score ||
    business.gtmetrixScore ||
    business.is_mobile_friendly !== undefined ||
    business.cms
  );
  
  const handleCalculateScore = async () => {
    if (!hasEnoughData) {
      toast.error('Not enough website data available. Please run website scans first.');
      return;
    }
    
    try {
      setIsCalculating(true);
      const newScore = calculateWebsiteOpportunityScore(business);
      setCurrentScore(newScore);
      
      // Recalculate SEO issues
      const issues = calculateSEOIssues(business);
      setSeoIssues(issues.specificIssues);
      
      if (onScoreUpdated) {
        onScoreUpdated(newScore);
      }
      
      toast.success('Opportunity score calculated successfully');
    } catch (error) {
      console.error('Error calculating opportunity score:', error);
      toast.error('Failed to calculate opportunity score');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Get score color based on value
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'bg-red-50 text-red-600 border-red-200';
    if (score >= 60) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (score >= 40) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    return 'bg-green-50 text-green-600 border-green-200';
  };
  
  // Get human-readable opportunity level
  const getOpportunityLevel = (score: number) => {
    if (score >= 80) return 'High Opportunity';
    if (score >= 60) return 'Good Opportunity';
    if (score >= 40) return 'Moderate Opportunity';
    return 'Low Opportunity';
  };
  
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Opportunity Assessment</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCalculateScore}
          disabled={isCalculating || !hasEnoughData}
        >
          {isCalculating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Calculating
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Score
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Opportunity Score</p>
          <div className="mt-1 flex items-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${getScoreColorClass(currentScore)}`}>
              {currentScore}
            </div>
            <span className="ml-3 font-medium">
              {getOpportunityLevel(currentScore)}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {currentScore >= 70 ? (
            <p>This business likely needs your services.</p>
          ) : currentScore >= 40 ? (
            <p>This business could benefit from your services.</p>
          ) : (
            <p>This business may not need immediate help.</p>
          )}
        </div>
      </div>
      
      {seoIssues.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Identified Issues:</p>
          <div className="flex flex-wrap gap-2">
            {seoIssues.map((issue, index) => (
              <Badge key={index} variant="outline" className="bg-amber-50">
                {issue}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {!hasEnoughData && (
        <div className="text-sm text-amber-600 mt-2">
          Not enough website data available. Please run website scans first.
        </div>
      )}
    </div>
  );
};

export default WebsiteOpportunityScore;
