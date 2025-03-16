
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { JobBoardResponse } from '@/types/opportunity';
import {
  EmptyState,
  ResultsHeader,
  JobResultsContent
} from './job-results';

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
    return <EmptyState />;
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
      <ResultsHeader 
        resultCount={results.jobs.length}
        source={results.source}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <JobResultsContent
        jobs={sortedJobs}
        viewMode={viewMode}
        onSaveJob={onSaveJob}
        savedJobs={savedJobs}
        priorityJobs={priorityJobs}
        onTogglePriority={togglePriority}
        isLoggedIn={isLoggedIn}
        formatDate={formatDate}
      />
    </div>
  );
};

// Re-export JobListing type because it's used in the component props
import { JobListing } from '@/types/opportunity';
export type { JobListing };

export default JobSearchResults;
