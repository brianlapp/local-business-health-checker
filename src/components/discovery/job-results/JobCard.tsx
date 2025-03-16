
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

interface JobCardProps {
  job: JobListing;
  onSaveJob: (job: JobListing) => void;
  isSaved: boolean;
  isPriority: boolean;
  onTogglePriority: (jobId: string) => void;
  isLoggedIn: boolean;
  formatDate: (dateString: string) => string;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSaveJob, 
  isSaved, 
  isPriority,
  onTogglePriority,
  isLoggedIn,
  formatDate 
}) => {
  return (
    <Card key={job.id} className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge variant="outline" className="mb-2">
            {job.source}
          </Badge>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" /> Posted {formatDate(job.datePosted)}
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2 pr-6 relative">
          {job.title}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            onClick={() => onTogglePriority(job.id)}
          >
            {isPriority ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardTitle>
        <CardDescription className="flex items-center text-sm">
          <Building className="h-4 w-4 mr-1 inline-block" /> 
          {job.company}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          {job.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.location}
            </Badge>
          )}
          {job.salary && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {job.salary}
            </Badge>
          )}
        </div>

        <p className="text-sm line-clamp-3">{job.description}</p>

        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex justify-between border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(job.url, '_blank')}
        >
          View Job <ExternalLink className="ml-1 h-3 w-3" />
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
            <>Save Job <BookmarkPlus className="ml-1 h-3 w-3" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
