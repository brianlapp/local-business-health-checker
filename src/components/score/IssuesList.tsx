
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
        active={issues.notMobileFriendly} 
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
