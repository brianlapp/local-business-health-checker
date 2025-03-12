
import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  return (
    <div className={cn(
      'text-2xl font-bold px-3 py-1 rounded-lg transition-colors',
      score <= 20 ? 'bg-green-50 text-green-500' : // Excellent
      score <= 40 ? 'bg-yellow-50 text-yellow-500' : // Good
      score <= 60 ? 'bg-orange-50 text-orange-500' : // Fair
      'bg-red-50 text-red-500' // Poor
    )}>
      {score}
    </div>
  );
};

export default ScoreBadge;
