
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, X, Clock, Zap, Smartphone, Lock, Type } from 'lucide-react';
import { Business } from '@/types/business';

interface ScoreDisplayProps {
  score: number;
  business: Business;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, business, className }) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-50';
    if (score >= 60) return 'text-orange-500 bg-orange-50';
    if (score >= 40) return 'text-yellow-500 bg-yellow-50';
    return 'text-green-500 bg-green-50';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'Poor';
    if (score >= 40) return 'Fair';
    return 'Good';
  };

  const scoreColor = getScoreColor(score);
  const scoreText = getScoreText(score);
  
  const { issues } = business;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center mb-4">
        <div className={cn('text-3xl font-bold w-20 h-20 flex items-center justify-center rounded-xl', scoreColor)}>
          {score}
        </div>
        <div className="ml-4">
          <p className="text-sm text-muted-foreground">Shit Score™</p>
          <h3 className="text-xl font-semibold">{scoreText}</h3>
          <p className="text-sm text-muted-foreground">Last checked: {business.lastChecked ? new Date(business.lastChecked).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {issues && (
          <>
            <IssueItem 
              icon={Zap} 
              title="Speed Issues" 
              active={issues.speedIssues} 
              info={`Page Speed: ${business.speedScore || 'N/A'}/100`}
            />
            <IssueItem 
              icon={Clock} 
              title="Outdated CMS" 
              active={issues.outdatedCMS} 
              info={business.cms || 'Unknown CMS'}
            />
            <IssueItem 
              icon={Lock} 
              title="No SSL" 
              active={issues.noSSL} 
            />
            <IssueItem 
              icon={Smartphone} 
              title="Not Mobile Friendly" 
              active={issues.notMobileFriendly} 
            />
            <IssueItem 
              icon={Type} 
              title="Bad Fonts" 
              active={issues.badFonts} 
            />
          </>
        )}
      </div>
    </div>
  );
};

interface IssueItemProps {
  icon: React.FC<any>;
  title: string;
  active: boolean;
  info?: string;
}

const IssueItem: React.FC<IssueItemProps> = ({ icon: Icon, title, active, info }) => {
  return (
    <div className={cn(
      'p-3 rounded-lg border transition-all duration-300 flex items-center',
      active ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
    )}>
      {active ? (
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
      ) : (
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
      )}
      <div className="flex-1">
        <p className={cn('text-sm font-medium', active ? 'text-red-700' : 'text-green-700')}>
          {title}
        </p>
        {info && <p className="text-xs text-muted-foreground">{info}</p>}
      </div>
    </div>
  );
};

export default ScoreDisplay;
