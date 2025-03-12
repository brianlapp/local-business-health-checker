
import React from 'react';
import { Zap, Clock, Lock, Smartphone, Type } from 'lucide-react';
import { Business } from '@/types/business';
import IssueItem from './IssueItem';

interface IssuesListProps {
  business: Business;
}

const IssuesList: React.FC<IssuesListProps> = ({ business }) => {
  const { issues } = business;

  if (!issues) return null;

  // Get mobile-friendly status directly if available
  const isMobileFriendly = typeof business.is_mobile_friendly === 'boolean' 
    ? business.is_mobile_friendly 
    : !issues.notMobileFriendly;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
      <IssueItem 
        icon={Zap} 
        title="Speed Issues" 
        active={issues.speedIssues} 
        info={`Page Speed: ${business.lighthouseScore || business.speedScore || 'N/A'}/100`}
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
        active={!isMobileFriendly} 
        info={isMobileFriendly ? 'Mobile optimized' : 'Not optimized for mobile'}
      />
      <IssueItem 
        icon={Type} 
        title="Bad Fonts" 
        active={issues.badFonts} 
      />
    </div>
  );
};

export default IssuesList;
