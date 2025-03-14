
import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types/opportunity';
import { toast } from 'sonner';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted: string; // Updated to match usage in JobSearchResults.tsx
  posted_date?: string; // Keep for backward compatibility
  salary?: string; // Added to match usage in JobSearchResults.tsx
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
  is_remote?: boolean;
  source: string;
}

export interface JobBoardResponse {
  jobs: JobListing[];
  count: number;
  source: string; // Added to match usage in JobSearchResults.tsx
  location?: string;
  query?: string;
  error?: string;
  message?: string;
}

/**
 * Search for job listings across various platforms
 */
export async function searchJobs(
  query: string, 
  location?: string, 
  remote?: boolean
): Promise<JobBoardResponse> {
  try {
    console.log(`Searching for jobs with query: ${query}, location: ${location}, remote: ${remote}`);
    
    // This would connect to real job board APIs in production
    // For now, return mock data
    const mockJobs: JobListing[] = [
      {
        id: 'job-1',
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Inc.',
        location: 'Toronto, ON',
        description: 'Looking for a skilled frontend developer with React experience...',
        url: 'https://example.com/job/1',
        datePosted: new Date().toISOString(),
        posted_date: new Date().toISOString(),
        salary: '$80,000 - $120,000',
        budget_min: 80000,
        budget_max: 120000,
        skills: ['React', 'TypeScript', 'CSS'],
        is_remote: true,
        source: 'LinkedIn'
      },
      {
        id: 'job-2',
        title: 'UI/UX Designer',
        company: 'Creative Agency',
        location: 'Vancouver, BC',
        description: 'Creative agency seeking talented UI/UX designer...',
        url: 'https://example.com/job/2',
        datePosted: new Date().toISOString(),
        posted_date: new Date().toISOString(),
        salary: '$70,000 - $90,000',
        budget_min: 70000,
        budget_max: 90000,
        skills: ['Figma', 'Adobe XD', 'UI Design'],
        is_remote: false,
        source: 'Indeed'
      }
    ];
    
    return {
      jobs: mockJobs,
      count: mockJobs.length,
      source: 'Mock Data'
    };
  } catch (error) {
    console.error('Error searching jobs:', error);
    toast.error('Failed to search for jobs');
    return {
      jobs: [],
      count: 0,
      source: 'Error',
      error: 'Failed to search for jobs'
    };
  }
}

/**
 * Save a job listing as an opportunity
 */
export async function saveJobAsOpportunity(job: JobListing, userId: string): Promise<Opportunity | null> {
  try {
    const newOpportunity: Omit<Opportunity, 'id'> = {
      title: job.title,
      description: job.description,
      source: 'job_board',
      source_id: job.id,
      source_url: job.url,
      client_name: job.company,
      location: job.location,
      is_remote: job.is_remote,
      budget_min: job.budget_min,
      budget_max: job.budget_max,
      status: 'new',
      skills: job.skills,
      discovered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert(newOpportunity)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Job saved as opportunity');
    return data as Opportunity;
  } catch (error) {
    console.error('Error saving job as opportunity:', error);
    toast.error('Failed to save job as opportunity');
    return null;
  }
}
