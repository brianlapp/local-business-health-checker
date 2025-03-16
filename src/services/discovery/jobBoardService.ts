
/**
 * Save a job listing as an opportunity
 */
export async function saveJobAsOpportunity(job: JobListing, userId: string): Promise<Opportunity | null> {
  try {
    // Create opportunity object without explicit type annotation
    const newOpportunity = {
      title: job.title,
      description: job.description,
      source: 'job_board' as 'job_board' | 'recruiting_agency' | 'direct_client' | 'other',
      source_id: job.id,
      source_url: job.url,
      client_name: job.company,
      client_website: null,
      location: job.location,
      is_remote: job.is_remote || false,
      budget_min: job.budget_min,
      budget_max: job.budget_max,
      status: 'new' as 'new' | 'reviewing' | 'applied' | 'interviewing' | 'won' | 'lost' | 'archived',
      skills: job.skills,
      user_id: userId,
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
