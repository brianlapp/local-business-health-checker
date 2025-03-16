
import { JobBoardResponse, JobListing } from '@/types/opportunity';
import { generateMockJobs } from './mockData';
import { filterJobs, JobFilters } from './filters';

/**
 * Search for job listings across multiple platforms
 */
export async function searchJobs(
  query: string,
  location: string,
  isRemote: boolean = false,
  source: string = 'all',
  filters?: JobFilters
): Promise<JobBoardResponse> {
  try {
    console.log(`Searching for ${query} in ${location}, remote: ${isRemote}, source: ${source}`);
    
    // In a real implementation, this would call the Supabase function
    // For now, we'll use mock data
    const useMockData = true; // Set to false when ready to use real API
    
    if (useMockData) {
      // Generate some mock data
      let mockJobs = generateMockJobs(query, location);
      
      // Apply source filter if specified
      if (source !== 'all') {
        mockJobs = mockJobs.filter(job => job.source.toLowerCase() === source.toLowerCase());
      }
      
      // Apply additional filters if provided
      if (filters) {
        mockJobs = filterJobs(mockJobs, {
          ...filters,
          isRemote: isRemote
        });
      }
      
      return {
        jobs: mockJobs,
        source: source === 'all' ? 'Multiple sources' : source,
        count: mockJobs.length,
        query,
        location
      };
    } else {
      // Call the actual API - placeholder for future implementation
      // const { data, error } = await supabase.functions.invoke('job-board-search', {
      //   body: { query, location, isRemote, source, filters }
      // });
      
      // if (error) throw error;
      // return data as JobBoardResponse;
      
      // Placeholder return until real API is implemented
      return {
        jobs: [],
        source: source,
        count: 0,
        query,
        location
      };
    }
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
}
