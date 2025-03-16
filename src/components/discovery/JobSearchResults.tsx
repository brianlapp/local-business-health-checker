
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookmarkPlus, CheckCircle, ExternalLink, MapPin, Building, Calendar, DollarSign } from 'lucide-react';
import { JobBoardResponse, JobListing } from '@/services/discovery/jobBoardService';
import { formatDistanceToNow } from 'date-fns';

interface JobSearchResultsProps {
  results: JobBoardResponse;
  onSaveJob: (job: JobListing) => void;
  savedJobs: Set<string>;
  isLoggedIn: boolean;
}

const JobSearchResults: React.FC<JobSearchResultsProps> = ({ 
  results, 
  onSaveJob, 
  savedJobs,
  isLoggedIn
}) => {
  if (results.jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search terms or location.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Results</h2>
        <div className="text-sm text-muted-foreground">
          Found {results.jobs.length} jobs from {results.source}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.jobs.map((job) => (
          <Card key={job.id} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Badge variant="outline" className="mb-2">
                  {job.source}
                </Badge>
                <Badge variant="secondary">
                  Posted {formatDate(job.datePosted)}
                </Badge>
              </div>
              <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
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
                variant={savedJobs.has(job.id) ? "secondary" : "default"}
                size="sm"
                onClick={() => onSaveJob(job)}
                disabled={savedJobs.has(job.id) || !isLoggedIn}
              >
                {savedJobs.has(job.id) ? (
                  <>Saved <CheckCircle className="ml-1 h-3 w-3" /></>
                ) : (
                  <>Save Job <BookmarkPlus className="ml-1 h-3 w-3" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobSearchResults;
