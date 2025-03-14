
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { JobListing, saveJobAsOpportunity } from '@/services/discovery/jobBoardService';

interface JobSearchResultsProps {
  jobs: JobListing[];
  isLoading: boolean;
}

const JobSearchResults: React.FC<JobSearchResultsProps> = ({ jobs, isLoading }) => {
  const { user } = useAuth();
  
  const handleSaveJob = async (job: JobListing) => {
    if (!user) {
      toast.error('You need to be logged in to save opportunities');
      return;
    }
    
    try {
      const result = await saveJobAsOpportunity(job, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save job');
      }
      
      toast.success('Job saved as opportunity!');
    } catch (error: any) {
      console.error('Error saving job:', error);
      toast.error(`Failed to save job: ${error.message}`);
    }
  };
  
  const openJobUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card border animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (jobs.length === 0) {
    return (
      <Card className="mt-8 text-center p-8">
        <CardTitle className="text-2xl mb-2">No jobs found</CardTitle>
        <CardDescription>
          Try adjusting your search terms or location to find more opportunities
        </CardDescription>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 mt-4">
      {jobs.map((job) => (
        <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  {job.company}
                  <span className="mx-2">•</span>
                  {job.location}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {job.source}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {job.skills?.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {job.salary && (
              <p className="mt-2 text-sm font-medium">{job.salary}</p>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Posted: {new Date(job.datePosted).toLocaleDateString()}
            </p>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 bg-muted/10">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleSaveJob(job)}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => openJobUrl(job.url)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default JobSearchResults;
