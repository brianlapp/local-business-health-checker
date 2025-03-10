
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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

export default IssueItem;
