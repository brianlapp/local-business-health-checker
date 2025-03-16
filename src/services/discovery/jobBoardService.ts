
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
  datePosted: string;
  posted_date?: string;
  salary?: string;
  budget_min?: number;
  budget_max?: number;
  skills?: string[];
  is_remote?: boolean;
  source: string;
  experienceLevel?: string;
}

export interface JobBoardResponse {
  jobs: JobListing[];
  count: number;
  source: string;
  location?: string;
  query?: string;
  error?: string;
  message?: string;
}

interface JobSearchFilters {
  experienceLevel?: string;
  datePosted?: string;
  minBudget?: number;
  maxResults?: number;
}

/**
 * Search for job listings across various platforms
 */
export async function searchJobs(
  query: string, 
  location?: string, 
  remote?: boolean,
  source?: string,
  filters?: JobSearchFilters
): Promise<JobBoardResponse> {
  try {
    console.log(`Searching for jobs with query: ${query}, location: ${location}, remote: ${remote}, source: ${source}`);
    
    // For now, return mock data with applied filters
    // In a production app, this would connect to the job-board-search edge function
    let mockJobs = getMockJobs(query, location || '', source);
    
    // Apply filters
    if (filters) {
      mockJobs = applyFiltersToJobs(mockJobs, filters);
    }
    
    return {
      jobs: mockJobs,
      count: mockJobs.length,
      source: source || 'Mock Data',
      location: location,
      query: query
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

/**
 * Apply filters to job listings
 */
function applyFiltersToJobs(jobs: JobListing[], filters: JobSearchFilters): JobListing[] {
  let filteredJobs = [...jobs];
  
  // Filter by experience level
  if (filters.experienceLevel && filters.experienceLevel !== 'any') {
    filteredJobs = filteredJobs.filter(job => {
      // This is a simple simulation - in reality, would need to analyze job description
      const title = job.title.toLowerCase();
      if (filters.experienceLevel === 'entry') {
        return title.includes('junior') || title.includes('entry') || title.includes('beginner');
      } else if (filters.experienceLevel === 'intermediate') {
        return title.includes('mid') || title.includes('intermediate');
      } else if (filters.experienceLevel === 'expert') {
        return title.includes('senior') || title.includes('lead') || title.includes('expert');
      }
      return true;
    });
  }
  
  // Filter by date posted
  if (filters.datePosted && filters.datePosted !== 'any') {
    const now = new Date();
    filteredJobs = filteredJobs.filter(job => {
      const postedDate = new Date(job.datePosted);
      if (filters.datePosted === 'today') {
        return (now.getTime() - postedDate.getTime()) < 24 * 60 * 60 * 1000;
      } else if (filters.datePosted === 'week') {
        return (now.getTime() - postedDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      } else if (filters.datePosted === 'month') {
        return (now.getTime() - postedDate.getTime()) < 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }
  
  // Filter by minimum budget
  if (filters.minBudget && filters.minBudget > 0) {
    filteredJobs = filteredJobs.filter(job => {
      return (job.budget_min || 0) >= (filters.minBudget || 0);
    });
  }
  
  // Limit results
  if (filters.maxResults && filters.maxResults > 0) {
    filteredJobs = filteredJobs.slice(0, filters.maxResults);
  }
  
  return filteredJobs;
}

/**
 * Generate mock job data for testing
 */
function getMockJobs(query: string, location: string, source?: string): JobListing[] {
  console.log(`Generating mock jobs for query: ${query}, location: ${location}, source: ${source}`);
  
  const jobTitles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'Product Manager', 'Data Scientist',
    'DevOps Engineer', 'Mobile Developer', 'QA Engineer'
  ];
  
  const companies = [
    'TechCorp', 'DataSystems', 'WebFusion', 'DesignMasters',
    'CodeNinjas', 'PixelPerfect', 'CloudScale', 'AppWorks',
    'DevStudio', 'BitBridge'
  ];
  
  const skills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript',
    'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL',
    'UI Design', 'UX Research', 'Figma', 'Adobe XD',
    'Git', 'CI/CD', 'REST APIs', 'GraphQL'
  ];
  
  const salaryRanges = [
    '$80,000 - $100,000', '$90,000 - $120,000', '$100,000 - $130,000',
    '$110,000 - $140,000', '$120,000 - $150,000', 'Competitive Salary',
    'Based on Experience', '$60 - $90 per hour', '$70 - $100 per hour'
  ];
  
  // Generate 10 mock jobs
  const mockJobs: JobListing[] = [];
  
  // Use the query to influence the job titles
  const queryLower = query.toLowerCase();
  let filteredTitles = jobTitles;
  
  if (queryLower.includes('frontend') || queryLower.includes('front')) {
    filteredTitles = jobTitles.filter(title => 
      title.toLowerCase().includes('frontend') || 
      title.toLowerCase().includes('ui') || 
      title.toLowerCase().includes('web')
    );
  } else if (queryLower.includes('backend') || queryLower.includes('back')) {
    filteredTitles = jobTitles.filter(title => 
      title.toLowerCase().includes('backend') || 
      title.toLowerCase().includes('data') || 
      title.toLowerCase().includes('devops')
    );
  } else if (queryLower.includes('design')) {
    filteredTitles = jobTitles.filter(title => 
      title.toLowerCase().includes('design') || 
      title.toLowerCase().includes('ui') || 
      title.toLowerCase().includes('ux')
    );
  }
  
  // If no matches, use all titles
  if (filteredTitles.length === 0) {
    filteredTitles = jobTitles;
  }
  
  // Use provided source or randomly select from these
  const sources = ['indeed', 'linkedin', 'upwork', 'freelancer'];
  const jobSource = source && source !== 'all' ? source : sources[Math.floor(Math.random() * sources.length)];
  
  for (let i = 0; i < 10; i++) {
    // Get a random title from the filtered list
    const titleIndex = Math.floor(Math.random() * filteredTitles.length);
    const title = filteredTitles[titleIndex];
    
    // Generate random data for other fields
    const companyIndex = Math.floor(Math.random() * companies.length);
    const company = companies[companyIndex];
    
    // Use the provided location or generate a random one
    const actualLocation = location === 'remote' ? 'Remote' : location;
    
    // Random date in the last 30 days
    const postedDate = new Date();
    postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30));
    
    // Random skill set based on the job title
    const jobSkills: string[] = [];
    const skillCount = 3 + Math.floor(Math.random() * 4); // 3-6 skills
    
    for (let j = 0; j < skillCount; j++) {
      const skillIndex = Math.floor(Math.random() * skills.length);
      if (!jobSkills.includes(skills[skillIndex])) {
        jobSkills.push(skills[skillIndex]);
      }
    }
    
    // Random salary range and budget values
    const salaryIndex = Math.floor(Math.random() * salaryRanges.length);
    const salary = salaryRanges[salaryIndex];
    
    // Generate random budget values
    const budgetMin = 50000 + Math.floor(Math.random() * 50000);
    const budgetMax = budgetMin + 20000 + Math.floor(Math.random() * 30000);
    
    // Create experience level based on title
    let experienceLevel = 'intermediate';
    if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
      experienceLevel = 'expert';
    } else if (title.toLowerCase().includes('junior') || title.toLowerCase().includes('assistant')) {
      experienceLevel = 'entry';
    }
    
    // Create a mock job listing
    mockJobs.push({
      id: `mock-${i}-${Date.now()}`,
      title: `${title} (${queryLower})`,
      company,
      location: actualLocation,
      description: `We are looking for an experienced ${title} to join our team. Required skills include ${jobSkills.join(', ')}. This is a ${location === 'remote' ? 'remote' : 'on-site'} position.`,
      url: `https://example.com/jobs/${title.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      salary,
      budget_min: budgetMin,
      budget_max: budgetMax,
      datePosted: postedDate.toISOString(),
      skills: jobSkills,
      is_remote: location === 'remote',
      source: jobSource,
      experienceLevel
    });
  }
  
  console.log(`Generated ${mockJobs.length} mock jobs`);
  return mockJobs;
}
