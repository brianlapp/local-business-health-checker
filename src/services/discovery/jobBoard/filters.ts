
import { JobListing } from '@/types/opportunity';

export interface JobFilters {
  minRate?: number;
  maxRate?: number;
  jobType?: string[];
  skills?: string[];
  datePosted?: string; // 'today', 'week', 'month', 'any'
  sources?: string[];
  isRemote?: boolean;
}

/**
 * Filter job listings based on various criteria
 */
export function filterJobs(jobs: JobListing[], filters: JobFilters): JobListing[] {
  if (!filters || Object.keys(filters).length === 0) {
    return jobs;
  }
  
  return jobs.filter(job => {
    // Filter by rate/budget
    if (filters.minRate && (!job.budget_min || job.budget_min < filters.minRate)) {
      return false;
    }
    
    if (filters.maxRate && (!job.budget_max || job.budget_max > filters.maxRate)) {
      return false;
    }
    
    // Filter by job type
    if (filters.jobType && filters.jobType.length > 0 && job.job_type) {
      if (!filters.jobType.some(type => job.job_type?.toLowerCase() === type.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by required skills
    if (filters.skills && filters.skills.length > 0) {
      if (!job.skills || job.skills.length === 0) {
        return false;
      }
      
      const jobSkillsLower = job.skills.map(skill => skill.toLowerCase());
      const requiredSkillsLower = filters.skills.map(skill => skill.toLowerCase());
      
      if (!requiredSkillsLower.some(skill => jobSkillsLower.includes(skill))) {
        return false;
      }
    }
    
    // Filter by date posted
    if (filters.datePosted && job.datePosted) {
      const jobDate = new Date(job.datePosted);
      const now = new Date();
      
      if (filters.datePosted === 'today') {
        // Posted today
        const today = new Date(now.setHours(0, 0, 0, 0));
        if (jobDate < today) {
          return false;
        }
      } else if (filters.datePosted === 'week') {
        // Posted in the last 7 days
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        if (jobDate < lastWeek) {
          return false;
        }
      } else if (filters.datePosted === 'month') {
        // Posted in the last 30 days
        const lastMonth = new Date(now);
        lastMonth.setDate(lastMonth.getDate() - 30);
        if (jobDate < lastMonth) {
          return false;
        }
      }
    }
    
    // Filter by sources
    if (filters.sources && filters.sources.length > 0) {
      if (!job.source || !filters.sources.some(source => 
        job.source?.toLowerCase() === source.toLowerCase()
      )) {
        return false;
      }
    }
    
    // Filter by remote status
    if (filters.isRemote !== undefined) {
      if (job.is_remote !== filters.isRemote) {
        return false;
      }
    }
    
    return true;
  });
}
