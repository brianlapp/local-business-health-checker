import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import JobSearchForm from '@/components/discovery/JobSearchForm';
import JobSearchResults from '@/components/discovery/JobSearchResults';
import { JobBoardResponse, JobListing, saveJobAsOpportunity, searchJobs } from '@/services/discovery/jobBoardService';
import { Loader2 } from 'lucide-react';

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<JobBoardResponse | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  
  const handleSearch = async (query: string, location: string, source: string) => {
    if (!query) return;
    
    setIsLoading(true);
    setSearchResults(null);
    
    try {
      // Fixed: The third parameter should be a boolean for 'remote', not a source string
      // Let's derive the isRemote value based on location being 'remote'
      const isRemote = location === 'remote';
      const results = await searchJobs(query, location, isRemote);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching jobs:', error);
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
      const savedOpportunity = await saveJobAsOpportunity(job, user.id);
      if (savedOpportunity) {
        // Add to saved jobs set to update UI
        setSavedJobs(prev => new Set([...prev, job.id]));
        toast.success('Job saved to opportunities');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job as opportunity');
    }
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Board</h1>
        <p className="text-muted-foreground">
          Search for freelance opportunities across multiple job platforms
        </p>
      </div>
      
      <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />
      
      <div className="mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching for jobs...</p>
          </div>
        ) : searchResults ? (
          <JobSearchResults 
            results={searchResults} 
            onSaveJob={handleSaveJob} 
            savedJobs={savedJobs}
            isLoggedIn={!!user}
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Enter search terms above to find freelance opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
