
import { useMemo } from 'react';
import { Business } from '@/types/business';

export function useBusinessStats(businesses: Business[]) {
  const stats = useMemo(() => {
    const totalBusinesses = businesses.length;
    
    // Calculate average score
    const totalScore = businesses.reduce((sum, business) => sum + business.score, 0);
    const averageScore = totalBusinesses > 0 ? Math.round(totalScore / totalBusinesses) : 0;
    
    // Count businesses with bad scores (less than 50)
    const badScoreCount = businesses.filter(business => business.score < 50).length;
    
    // Count businesses with security issues
    const securityIssuesCount = businesses.filter(
      business => business.issues?.noSSL || false
    ).length;
    
    // Count businesses with performance issues
    const performanceIssuesCount = businesses.filter(
      business => business.issues?.speedIssues || false
    ).length;
    
    return {
      totalBusinesses,
      averageScore,
      badScoreCount,
      securityIssuesCount,
      performanceIssuesCount
    };
  }, [businesses]);
  
  return stats;
}
