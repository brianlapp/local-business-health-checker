
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Opportunity } from '@/types/opportunity';

/**
 * Search for job opportunities across various job boards
 */
export async function searchJobs(query: string, location: string = '', source: string = 'all') {
  try {
    console.log(`Searching jobs with query: ${query}, location: ${location}, source: ${source}`);
    
    // This is a placeholder - in a real implementation, this would connect to various job board APIs
    return {
      jobs: [],
      count: 0,
      query,
      location,
      source
    };
  } catch (error) {
    console.error('Error searching jobs:', error);
    toast.error('Failed to search jobs');
    return {
      jobs: [],
      count: 0,
      query,
      location,
      source,
      error: 'Failed to search jobs'
    };
  }
}

/**
 * Save a job from a job board as a potential opportunity
 */
export async function saveJobAsOpportunity(jobData: any): Promise<Opportunity | null> {
  try {
    // Convert job data to opportunity format
    const opportunityData = {
      title: jobData.title,
      description: jobData.description,
      source: 'job_board',
      source_id: jobData.id,
      source_url: jobData.url,
      client_name: jobData.company,
      location: jobData.location,
      is_remote: jobData.remote || false,
      skills: jobData.skills || [],
      status: 'new'
    };
    
    // Save to database
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunityData)
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
