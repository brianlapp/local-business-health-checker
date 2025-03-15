
import { Opportunity } from '@/types/opportunity';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Factors affecting opportunity score:
 * - Budget range (higher = better score)
 * - Skills match (more matches = better score)
 * - Timeline compatibility
 * - Location/remote preference
 * - Client reputation/tier
 */

export interface EvaluationCriteria {
  userSkills: string[];
  preferredBudgetMin?: number;
  preferredBudgetMax?: number;
  preferredLocation?: string;
  preferRemote?: boolean;
  availableFrom?: Date;
  availableTo?: Date;
}

export interface EvaluationResult {
  score: number;
  budgetScore: number;
  skillsScore: number;
  locationScore: number;
  timelineScore: number;
  breakdown: {
    budget: string;
    skills: string;
    location: string;
    timeline: string;
  };
}

/**
 * Evaluate an opportunity based on various criteria
 */
export async function evaluateOpportunity(
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): Promise<EvaluationResult> {
  // Budget score (0-25 points)
  const budgetScore = calculateBudgetScore(opportunity, criteria);
  
  // Skills score (0-35 points)
  const skillsScore = calculateSkillsScore(opportunity, criteria);
  
  // Location score (0-20 points)
  const locationScore = calculateLocationScore(opportunity, criteria);
  
  // Timeline score (0-20 points)
  const timelineScore = calculateTimelineScore(opportunity, criteria);
  
  // Calculate overall score (0-100)
  const totalScore = Math.min(
    Math.round(budgetScore + skillsScore + locationScore + timelineScore),
    100
  );
  
  return {
    score: totalScore,
    budgetScore,
    skillsScore,
    locationScore,
    timelineScore,
    breakdown: {
      budget: getBudgetBreakdown(budgetScore),
      skills: getSkillsBreakdown(skillsScore, opportunity, criteria),
      location: getLocationBreakdown(locationScore, opportunity, criteria),
      timeline: getTimelineBreakdown(timelineScore)
    }
  };
}

/**
 * Save the evaluation score to the opportunity record
 */
export async function saveOpportunityScore(
  opportunityId: string, 
  score: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('opportunities')
      .update({ score, updated_at: new Date().toISOString() })
      .eq('id', opportunityId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving opportunity score:', error);
    toast.error('Failed to save opportunity score');
    return false;
  }
}

/**
 * Calculate budget score (0-25 points)
 */
function calculateBudgetScore(
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): number {
  // If no budget information in opportunity, return neutral score
  if (!opportunity.budget_min && !opportunity.budget_max) {
    return 12.5; // Half points for unknown budget
  }
  
  // If no preferred budget criteria, return neutral score
  if (!criteria.preferredBudgetMin && !criteria.preferredBudgetMax) {
    return 12.5; // Half points when we don't know preference
  }
  
  // Calculate budget match percentage
  let budgetMatch = 0;
  
  // Case 1: Opportunity has a range, criteria has a range
  if (opportunity.budget_min && opportunity.budget_max && 
      criteria.preferredBudgetMin && criteria.preferredBudgetMax) {
    
    // Check for overlap between ranges
    const opportunityRange = opportunity.budget_max - opportunity.budget_min;
    const preferredRange = criteria.preferredBudgetMax - criteria.preferredBudgetMin;
    
    const overlapStart = Math.max(opportunity.budget_min, criteria.preferredBudgetMin);
    const overlapEnd = Math.min(opportunity.budget_max, criteria.preferredBudgetMax);
    
    if (overlapEnd > overlapStart) {
      // There is overlap
      const overlapSize = overlapEnd - overlapStart;
      
      // Calculate match percentage based on overlap size vs. preferred range
      budgetMatch = Math.min((overlapSize / preferredRange) * 100, 100);
    } else {
      // No overlap, calculate proximity
      const distance = (overlapStart - overlapEnd) / preferredRange;
      budgetMatch = Math.max(0, 100 - (distance * 50)); // Reduce score based on distance
    }
  } 
  // Case 2: Opportunity has only max budget
  else if (opportunity.budget_max && criteria.preferredBudgetMin) {
    if (opportunity.budget_max >= criteria.preferredBudgetMin) {
      budgetMatch = 100; // Above minimum is good
    } else {
      // Below minimum - calculate how close
      const distance = (criteria.preferredBudgetMin - opportunity.budget_max) / criteria.preferredBudgetMin;
      budgetMatch = Math.max(0, 100 - (distance * 100));
    }
  }
  // Case 3: Opportunity has only min budget
  else if (opportunity.budget_min && criteria.preferredBudgetMax) {
    if (opportunity.budget_min <= criteria.preferredBudgetMax) {
      // Check how close to maximum preferred budget
      const ratio = opportunity.budget_min / criteria.preferredBudgetMax;
      budgetMatch = 100 * (1 - Math.max(0, ratio - 0.7)); // Reduce score if too close to max
    } else {
      // Above maximum - calculate how far over
      const distance = (opportunity.budget_min - criteria.preferredBudgetMax) / criteria.preferredBudgetMax;
      budgetMatch = Math.max(0, 100 - (distance * 100));
    }
  }
  
  // Convert match percentage to score out of 25
  return (budgetMatch / 100) * 25;
}

/**
 * Calculate skills score (0-35 points)
 */
function calculateSkillsScore(
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): number {
  // If no skills information in opportunity, return low score
  if (!opportunity.skills || opportunity.skills.length === 0) {
    return 10; // Minimal points for unknown skills
  }
  
  // If no preferred skills criteria, return neutral score
  if (!criteria.userSkills || criteria.userSkills.length === 0) {
    return 17.5; // Half points when we don't know preferences
  }
  
  const oppSkills = opportunity.skills.map(s => s.toLowerCase());
  const userSkills = criteria.userSkills.map(s => s.toLowerCase());
  
  // Count matching skills
  let matchCount = 0;
  for (const skill of userSkills) {
    if (oppSkills.some(s => s.includes(skill) || skill.includes(s))) {
      matchCount++;
    }
  }
  
  // Calculate match percentage
  const maxPossibleMatches = Math.min(userSkills.length, oppSkills.length);
  if (maxPossibleMatches === 0) return 10;
  
  const matchPercentage = (matchCount / maxPossibleMatches) * 100;
  
  // Calculate skill relevance
  const relevancePercentage = Math.min(
    (matchCount / userSkills.length) * 100, 
    100
  );
  
  // Combined score weighted towards relevance
  const combinedScore = (matchPercentage * 0.4) + (relevancePercentage * 0.6);
  
  // Convert to score out of 35
  return (combinedScore / 100) * 35;
}

/**
 * Calculate location score (0-20 points)
 */
function calculateLocationScore(
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): number {
  // If opportunity is remote or user prefers remote
  if (opportunity.is_remote && criteria.preferRemote) {
    return 20; // Full score for remote match
  }
  
  // If opportunity requires on-site but user prefers remote
  if (!opportunity.is_remote && criteria.preferRemote) {
    return 5; // Low score for mismatch
  }
  
  // If no location information, return neutral score
  if (!opportunity.location || !criteria.preferredLocation) {
    return 10; // Half points for unknown location
  }
  
  // Simple location matching
  const opportunityLocation = opportunity.location.toLowerCase();
  const preferredLocation = criteria.preferredLocation.toLowerCase();
  
  // Exact match
  if (opportunityLocation.includes(preferredLocation) || 
      preferredLocation.includes(opportunityLocation)) {
    return 20;
  }
  
  // Partial match (same country or region perhaps)
  if (opportunityLocation.split(',').some(part => 
      preferredLocation.includes(part.trim()) || 
      preferredLocation.split(',').some(prefPart => 
        prefPart.trim() === part.trim()
      )
    )) {
    return 15;
  }
  
  // No match
  return 5;
}

/**
 * Calculate timeline score (0-20 points)
 */
function calculateTimelineScore(
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): number {
  // If no timeline information, return neutral score
  if (!criteria.availableFrom && !criteria.availableTo) {
    return 10; // Half points for unknown availability
  }
  
  // For now, return a neutral score as we don't have detailed timeline data
  // This would be expanded with real implementation when we have timeline data
  return 10;
}

/**
 * Get descriptive breakdown of budget score
 */
function getBudgetBreakdown(score: number): string {
  if (score >= 20) return "Excellent budget match";
  if (score >= 15) return "Good budget match";
  if (score >= 10) return "Acceptable budget";
  if (score >= 5) return "Below preferred budget";
  return "Poor budget match";
}

/**
 * Get descriptive breakdown of skills score
 */
function getSkillsBreakdown(
  score: number, 
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): string {
  if (!opportunity.skills || opportunity.skills.length === 0) {
    return "Skills information not available";
  }
  
  if (!criteria.userSkills || criteria.userSkills.length === 0) {
    return `Required skills: ${opportunity.skills.join(', ')}`;
  }
  
  const oppSkills = opportunity.skills.map(s => s.toLowerCase());
  const userSkills = criteria.userSkills.map(s => s.toLowerCase());
  
  const matchingSkills = userSkills.filter(skill => 
    oppSkills.some(s => s.includes(skill) || skill.includes(s))
  );
  
  if (matchingSkills.length === 0) {
    return "No matching skills found";
  }
  
  if (score >= 25) {
    return `Strong match: ${matchingSkills.join(', ')}`;
  }
  
  if (score >= 15) {
    return `Good match: ${matchingSkills.join(', ')}`;
  }
  
  return `Some matching skills: ${matchingSkills.join(', ')}`;
}

/**
 * Get descriptive breakdown of location score
 */
function getLocationBreakdown(
  score: number,
  opportunity: Opportunity,
  criteria: EvaluationCriteria
): string {
  if (opportunity.is_remote) {
    return "Remote work available";
  }
  
  if (!opportunity.location) {
    return "Location not specified";
  }
  
  if (criteria.preferRemote && !opportunity.is_remote) {
    return `On-site required in ${opportunity.location}`;
  }
  
  if (score >= 15) {
    return `Location match: ${opportunity.location}`;
  }
  
  return `Location: ${opportunity.location}`;
}

/**
 * Get descriptive breakdown of timeline score
 */
function getTimelineBreakdown(score: number): string {
  // This would be expanded with real implementation
  return "Timeline compatibility not fully assessed";
}

/**
 * Batch evaluate multiple opportunities
 */
export async function evaluateOpportunities(
  opportunities: Opportunity[],
  criteria: EvaluationCriteria
): Promise<Map<string, EvaluationResult>> {
  const results = new Map<string, EvaluationResult>();
  
  for (const opportunity of opportunities) {
    const result = await evaluateOpportunity(opportunity, criteria);
    results.set(opportunity.id, result);
  }
  
  return results;
}

/**
 * Get user's evaluation criteria from profile
 */
export async function getUserEvaluationCriteria(userId: string): Promise<EvaluationCriteria> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('skills, hourly_rate, availability')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    // Convert hourly rate to preferred budget range
    // Assuming standard 160 hours/month for full-time equivalent
    const monthlyRate = profile.hourly_rate ? profile.hourly_rate * 160 : undefined;
    
    return {
      userSkills: profile.skills || [],
      preferredBudgetMin: monthlyRate ? monthlyRate * 0.8 : undefined, // 80% of target
      preferredBudgetMax: monthlyRate ? monthlyRate * 1.2 : undefined, // 120% of target
      preferRemote: true // Default to preferring remote work
    };
  } catch (error) {
    console.error('Error getting user evaluation criteria:', error);
    // Return default criteria
    return {
      userSkills: [],
      preferRemote: true
    };
  }
}
