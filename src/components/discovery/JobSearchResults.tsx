
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookmarkPlus, 
  CheckCircle, 
  ExternalLink, 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign,
  Clock,
  ArrowUpDown,
  Star,
  StarOff,
  Filter
} from 'lucide-react';
import { JobBoardResponse, JobListing } from '@/services/discovery/jobBoardService';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [priorityJobs, setPriorityJobs] = useState<Set<string>>(new Set());

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

  const togglePriority = (jobId: string) => {
    const newPriorityJobs = new Set(priorityJobs);
    if (newPriorityJobs.has(jobId)) {
      newPriorityJobs.delete(jobId);
    } else {
      newPriorityJobs.add(jobId);
    }
    setPriorityJobs(newPriorityJobs);
  };

  // Sort jobs based on selected criteria
  const sortedJobs = [...results.jobs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    } else if (sortBy === 'salary') {
      const aSalary = a.budget_max || 0;
      const bSalary = b.budget_max || 0;
      return bSalary - aSalary;
    } else if (sortBy === 'priority') {
      const aIsPriority = priorityJobs.has(a.id) ? 1 : 0;
      const bIsPriority = priorityJobs.has(b.id) ? 1 : 0;
      return bIsPriority - aIsPriority;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Results</h2>
          <div className="text-sm text-muted-foreground">
            Found {results.jobs.length} jobs from {results.source}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>Sort by</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Posted</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={viewMode} className="w-full">
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSaveJob={onSaveJob} 
                isSaved={savedJobs.has(job.id)}
                isPriority={priorityJobs.has(job.id)}
                onTogglePriority={togglePriority}
                isLoggedIn={isLoggedIn}
                formatDate={formatDate}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {sortedJobs.map((job) => (
              <JobListItem 
                key={job.id} 
                job={job} 
                onSaveJob={onSaveJob} 
                isSaved={savedJobs.has(job.id)}
                isPriority={priorityJobs.has(job.id)}
                onTogglePriority={togglePriority}
                isLoggedIn={isLoggedIn}
                formatDate={formatDate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface JobItemProps {
  job: JobListing;
  onSaveJob: (job: JobListing) => void;
  isSaved: boolean;
  isPriority: boolean;
  onTogglePriority: (jobId: string) => void;
  isLoggedIn: boolean;
  formatDate: (dateString: string) => string;
}

const JobCard: React.FC<JobItemProps> = ({ 
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

const JobListItem: React.FC<JobItemProps> = ({ 
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

export default JobSearchResults;
