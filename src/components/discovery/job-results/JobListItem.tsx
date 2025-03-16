
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookmarkPlus, 
  CheckCircle, 
  ExternalLink, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign,
  Star,
  StarOff
} from 'lucide-react';
import { JobListing } from '@/types/opportunity';

interface JobListItemProps {
  job: JobListing;
  onSaveJob: (job: JobListing) => void;
  isSaved: boolean;
  isPriority: boolean;
  onTogglePriority: (jobId: string) => void;
  isLoggedIn: boolean;
  formatDate: (dateString: string) => string;
}

const JobListItem: React.FC<JobListItemProps> = ({ 
  job, 
  onSaveJob, 
  isSaved, 
  isPriority,
  onTogglePriority,
  isLoggedIn,
  formatDate 
}) => {
  return (
    <Card className="flex flex-col md:flex-row">
      <div className="flex-grow p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{job.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onTogglePriority(job.id)}
              >
                {isPriority ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-3 mt-1">
              <span className="flex items-center">
                <Building className="h-3 w-3 mr-1" /> 
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" /> 
                  {job.location}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" /> 
                {formatDate(job.datePosted)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Badge variant="outline">{job.source}</Badge>
            {job.salary && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> {job.salary}
              </Badge>
            )}
          </div>
        </div>
        
        {job.skills && job.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="flex md:flex-col justify-between border-t md:border-t-0 md:border-l p-4 gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(job.url, '_blank')}
        >
          View <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
        <Button
          variant={isSaved ? "secondary" : "default"}
          size="sm"
          onClick={() => onSaveJob(job)}
          disabled={isSaved || !isLoggedIn}
        >
          {isSaved ? (
            <>Saved <CheckCircle className="ml-1 h-3 w-3" /></>
          ) : (
            <>Save <BookmarkPlus className="ml-1 h-3 w-3" /></>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default JobListItem;
