
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { JobListing, searchJobs } from '@/services/discovery/jobBoardService';
import JobSearchForm from '@/components/discovery/JobSearchForm';
import JobSearchResults from '@/components/discovery/JobSearchResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Building, Database, Search } from 'lucide-react';

const JobBoard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async (query: string, location: string, source: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await searchJobs(query, location, source);
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-2">Job Board</h1>
      <p className="text-muted-foreground mb-8">
        Find freelance opportunities and job listings from multiple sources
      </p>
      
      <Tabs defaultValue="search" className="mb-8">
        <TabsList>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Database className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="agencies">
            <Building className="h-4 w-4 mr-2" />
            Agencies
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Briefcase className="h-4 w-4 mr-2" />
            Clients
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-6">
          <div className="mb-4">
            <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />
          </div>
          
          {(hasSearched || jobs.length > 0) && (
            <JobSearchResults jobs={jobs} isLoading={isLoading} />
          )}
          
          {!hasSearched && jobs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Search for Jobs</h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Enter a search term, location, and select a job board to find freelance opportunities
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="text-center py-12">
            <Database className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Saved Opportunities</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Your saved opportunities will appear here. Use the "Save" button when browsing jobs.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="agencies">
          <div className="text-center py-12">
            <Building className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              The agency search feature is currently in development
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="clients">
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              The client search feature is currently in development
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobBoard;
