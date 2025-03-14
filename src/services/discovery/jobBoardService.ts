
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { invokeEdgeFunction } from '../api/supabaseApiClient';
import { Opportunity } from '@/types/opportunity';

/**
 * Types for job board responses
 */
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  datePosted: string;
  skills?: string[];
  source: string;
}

export interface JobBoardResponse {
  jobs: JobListing[];
  count: number;
  source: string;
  query: string;
  timestamp: string;
  error?: string;
  message?: string;
}

/**
 * Search for jobs from various job boards
 * @param query - Search term (e.g. "react developer")
 * @param location - Location (e.g. "remote" or "new york")
 * @param source - Job board source (e.g. "indeed", "linkedin", or "all")
 */
export async function searchJobs(
  query: string,
  location: string = 'remote',
  source: string = 'all'
): Promise<JobBoardResponse> {
  try {
    console.log(`Searching for "${query}" jobs in "${location}" from "${source}"`);
    
    const { data, error } = await invokeEdgeFunction('job-board-search', { 
      query, 
      location,
      source 
    });
    
    if (error) {
      console.error('Job search error:', error);
      toast.error(`Error searching for jobs: ${error.message}`);
      return {
        jobs: [],
        count: 0,
        source: source,
        query: query,
        timestamp: new Date().toISOString(),
        error: error.message,
        message: 'Failed to search for jobs'
      };
    }
    
    if (data.error) {
      console.error('Job search API error:', data.error);
      toast.error(data.message || 'Failed to search for jobs');
      return {
        jobs: [],
        count: 0,
        source: source,
        query: query,
        timestamp: new Date().toISOString(),
        error: data.error,
        message: data.message || 'Failed to search for jobs'
      };
    }
    
    console.log(`Found ${data.jobs?.length || 0} jobs from ${source}`);
    
    if (data.jobs?.length) {
      toast.success(`Found ${data.jobs.length} job opportunities`);
    } else {
      toast.info('No jobs found matching your criteria');
    }
    
    return {
      jobs: data.jobs || [],
      count: data.jobs?.length || 0,
      source: data.source || source,
      query: query,
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error searching for jobs:', error);
    toast.error(`Error searching for jobs: ${error.message || 'Unknown error'}`);
    return {
      jobs: [],
      count: 0,
      source: source,
      query: query,
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Failed to search for jobs'
    };
  }
}

/**
 * Convert a job listing to an opportunity
 */
export function convertJobToOpportunity(job: JobListing): Partial<Opportunity> {
  return {
    title: job.title,
    client_name: job.company,
    location: job.location,
    description: job.description,
    source_url: job.url,
    source: job.source,
    estimated_budget: job.salary,
    skills_required: job.skills?.join(', '),
    opportunity_type: 'job',
    status: 'new',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Save a job listing as an opportunity
 */
export async function saveJobAsOpportunity(
  job: JobListing, 
  userId: string
): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
  try {
    const opportunityData = {
      ...convertJobToOpportunity(job),
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunityData)
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    toast.success('Job saved as opportunity');
    return { success: true, opportunityId: data.id };
  } catch (error: any) {
    console.error('Error saving job as opportunity:', error);
    toast.error(`Error saving opportunity: ${error.message}`);
    return { success: false, error: error.message };
  }
}
