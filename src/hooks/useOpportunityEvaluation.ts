
import { useState } from 'react';
import { Opportunity } from '@/types/opportunity';
import { 
  evaluateOpportunity, 
  evaluateOpportunities,
  saveOpportunityScore,
  getUserEvaluationCriteria,
  EvaluationCriteria,
  EvaluationResult
} from '@/services/evaluation/opportunityEvaluationService';
import { useAuth } from '@/contexts/AuthContext';

export function useOpportunityEvaluation() {
  const { user } = useAuth();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria>({
    userSkills: [],
    preferRemote: true
  });
  
  // Load user's evaluation criteria from their profile
  const loadUserCriteria = async () => {
    if (!user?.id) return;
    
    try {
      const criteria = await getUserEvaluationCriteria(user.id);
      setEvaluationCriteria(criteria);
      return criteria;
    } catch (error) {
      console.error('Error loading evaluation criteria:', error);
    }
  };
  
  // Evaluate a single opportunity
  const evaluateSingleOpportunity = async (
    opportunity: Opportunity,
    criteria?: EvaluationCriteria
  ): Promise<EvaluationResult> => {
    setIsEvaluating(true);
    
    try {
      const actualCriteria = criteria || evaluationCriteria;
      const result = await evaluateOpportunity(opportunity, actualCriteria);
      
      // Save the score to the database
      await saveOpportunityScore(opportunity.id, result.score);
      
      return result;
    } catch (error) {
      console.error('Error evaluating opportunity:', error);
      throw error;
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Evaluate multiple opportunities
  const evaluateMultipleOpportunities = async (
    opportunities: Opportunity[],
    criteria?: EvaluationCriteria
  ): Promise<Map<string, EvaluationResult>> => {
    setIsEvaluating(true);
    
    try {
      const actualCriteria = criteria || evaluationCriteria;
      const results = await evaluateOpportunities(opportunities, actualCriteria);
      
      // Save scores to database
      for (const [id, result] of results.entries()) {
        await saveOpportunityScore(id, result.score);
      }
      
      return results;
    } catch (error) {
      console.error('Error evaluating opportunities:', error);
      throw error;
    } finally {
      setIsEvaluating(false);
    }
  };
  
  return {
    isEvaluating,
    evaluationCriteria,
    setEvaluationCriteria,
    loadUserCriteria,
    evaluateSingleOpportunity,
    evaluateMultipleOpportunities
  };
}
