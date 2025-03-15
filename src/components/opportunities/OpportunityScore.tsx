
import React from 'react';
import { Opportunity } from '@/types/opportunity';
import { 
  EvaluationResult, 
  evaluateOpportunity 
} from '@/services/evaluation/opportunityEvaluationService';
import { Progress } from '@/components/ui/progress';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, BarChart2, DollarSign, MapPin } from 'lucide-react';

interface OpportunityScoreProps {
  opportunity: Opportunity;
  evaluation?: EvaluationResult;
  compact?: boolean;
}

const OpportunityScore: React.FC<OpportunityScoreProps> = ({ 
  opportunity, 
  evaluation,
  compact = false
}) => {
  const score = evaluation?.score || opportunity.score || 0;
  
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 65) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    if (value >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getScoreText = (value: number) => {
    if (value >= 80) return 'Excellent Match';
    if (value >= 65) return 'Good Match';
    if (value >= 50) return 'Fair Match';
    if (value >= 35) return 'Poor Match';
    return 'Very Poor Match';
  };
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5">
              <div 
                className={`h-2.5 w-2.5 rounded-full ${getScoreColor(score)}`} 
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{score}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getScoreText(score)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-3 p-2">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs text-muted-foreground">Match</div>
          </div>
          <Progress
            value={score}
            className="h-2 flex-1"
            indicatorClassName={getScoreColor(score)}
          />
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">{getScoreText(score)}</h4>
          
          {evaluation && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    <span>Budget</span>
                  </div>
                  <Progress value={(evaluation.budgetScore / 25) * 100} className="h-1.5 w-24" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Award className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    <span>Skills</span>
                  </div>
                  <Progress value={(evaluation.skillsScore / 35) * 100} className="h-1.5 w-24" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                    <span>Location</span>
                  </div>
                  <Progress value={(evaluation.locationScore / 20) * 100} className="h-1.5 w-24" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    <span>Timeline</span>
                  </div>
                  <Progress value={(evaluation.timelineScore / 20) * 100} className="h-1.5 w-24" />
                </div>
              </div>
              
              <div className="pt-2 text-xs text-muted-foreground">
                <p>{evaluation.breakdown.skills}</p>
                <p>{evaluation.breakdown.budget}</p>
                <p>{evaluation.breakdown.location}</p>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default OpportunityScore;
