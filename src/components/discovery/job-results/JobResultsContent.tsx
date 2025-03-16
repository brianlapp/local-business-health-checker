
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import JobCard from './JobCard';
import JobListItem from './JobListItem';
import { JobListing } from '@/types/opportunity';

interface JobResultsContentProps {
  jobs: JobListing[];
  viewMode: string;
  onSaveJob: (job: JobListing) => void;
  savedJobs: Set<string>;
  priorityJobs: Set<string>;
  onTogglePriority: (jobId: string) => void;
  isLoggedIn: boolean;
  formatDate: (dateString: string) => string;
}

const JobResultsContent: React.FC<JobResultsContentProps> = ({
  jobs,
  viewMode,
  onSaveJob,
  savedJobs,
  priorityJobs,
  onTogglePriority,
  isLoggedIn,
  formatDate
}) => {
  return (
    <Tabs value={viewMode} className="w-full">
      <TabsContent value="grid" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onSaveJob={onSaveJob} 
              isSaved={savedJobs.has(job.id)}
              isPriority={priorityJobs.has(job.id)}
              onTogglePriority={onTogglePriority}
              isLoggedIn={isLoggedIn}
              formatDate={formatDate}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="list" className="mt-0">
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobListItem 
              key={job.id} 
              job={job} 
              onSaveJob={onSaveJob} 
              isSaved={savedJobs.has(job.id)}
              isPriority={priorityJobs.has(job.id)}
              onTogglePriority={onTogglePriority}
              isLoggedIn={isLoggedIn}
              formatDate={formatDate}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default JobResultsContent;
