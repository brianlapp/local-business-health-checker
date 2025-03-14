
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JobListing, JobBoardResponse, searchJobs, saveJobAsOpportunity } from '@/services/discovery/jobBoardService';
import { toast } from 'sonner';
import JobSearchForm from '@/components/discovery/JobSearchForm';
import JobSearchResults from '@/components/discovery/JobSearchResults';

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<JobBoardResponse | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const handleSearch = async (query: string, location: string, source: string) => {
    setIsLoading(true);
    try {
      const results = await searchJobs(query, location, source);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for jobs:', error);
      toast.error('Failed to search for jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async (job: JobListing) => {
    if (!user) {
      toast.error('You must be logged in to save jobs');
      return;
    }

    try {
      const result = await saveJobAsOpportunity(job, user.id);
      
      if (result.success) {
        setSavedJobs((prev) => new Set([...prev, job.id]));
        toast.success('Job saved as opportunity');
      } else {
        toast.error(`Failed to save job: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Board</h1>
        <p className="text-muted-foreground">
          Search for job opportunities across multiple platforms and save them to your opportunities list.
        </p>
      </div>

      <div className="mb-8">
        <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {searchResults && (
        <JobSearchResults 
          results={searchResults} 
          onSaveJob={handleSaveJob}
          savedJobs={savedJobs}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
};

export default JobBoard;
