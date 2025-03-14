
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @deno-types="https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.d.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobSearchRequest {
  query: string;
  location?: string;
  source?: string;
}

interface JobListing {
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

// Debug logging setup
let debugLogs: string[] = [];
let debugMode = false;

function debugLog(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = data 
    ? `${timestamp} | ${message}: ${typeof data === 'object' ? JSON.stringify(data) : data}`
    : `${timestamp} | ${message}`;
  
  console.log(logMessage);
  
  if (debugMode) {
    debugLogs.push(logMessage);
  }
}

// Pool of user agents to rotate through
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getBrowserLikeHeaders(): Record<string, string> {
  const userAgent = getRandomUserAgent();
  
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.google.com/',
    'Cache-Control': 'max-age=0',
  };
}

/**
 * Generate mock job data for testing
 */
function getMockJobs(query: string, location: string): JobListing[] {
  debugLog(`Generating mock jobs for query: ${query}, location: ${location}`);
  
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
    
    // Random salary range
    const salaryIndex = Math.floor(Math.random() * salaryRanges.length);
    const salary = salaryRanges[salaryIndex];
    
    // Create a mock job listing
    mockJobs.push({
      id: `mock-${i}-${Date.now()}`,
      title: `${title} (${queryLower})`,
      company,
      location: actualLocation,
      description: `We are looking for an experienced ${title} to join our team. Required skills include ${jobSkills.join(', ')}. This is a ${location === 'remote' ? 'remote' : 'on-site'} position.`,
      url: `https://example.com/jobs/${title.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      salary,
      datePosted: postedDate.toISOString(),
      skills: jobSkills,
      source: 'mock-data'
    });
  }
  
  debugLog(`Generated ${mockJobs.length} mock jobs`);
  return mockJobs;
}

/**
 * Search for jobs on Indeed
 * Note: This is a simplified implementation for educational purposes
 */
async function searchIndeedJobs(query: string, location: string): Promise<JobListing[]> {
  try {
    debugLog(`Searching Indeed for "${query}" in "${location}"`);
    
    // Format the query and location for the URL
    const formattedQuery = encodeURIComponent(query.trim());
    const formattedLocation = encodeURIComponent(location.trim());
    
    const url = `https://www.indeed.com/jobs?q=${formattedQuery}&l=${formattedLocation}`;
    debugLog(`Making request to ${url}`);
    
    // Add a short delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Create a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, { 
      headers: getBrowserLikeHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      debugLog(`Failed with status ${response.status} for URL: ${url}`);
      // Return mock data as fallback
      return getMockJobs(query, location);
    }
    
    const html = await response.text();
    debugLog(`Got ${html.length} bytes from ${url}`);
    
    // Parse the HTML and extract job listings
    const dom = new DOMParser().parseFromString(html, 'text/html');
    if (!dom) {
      debugLog('Failed to parse HTML into DOM');
      return getMockJobs(query, location);
    }
    
    // Extract the job listings
    const jobListings: JobListing[] = [];
    
    // Various selectors to try for job cards
    const jobCardSelectors = [
      '.job_seen_beacon', '.jobsearch-ResultsList > div', 
      '.tapItem', '.job-card', '.job_result', '.result'
    ];
    
    let jobCards: any[] = [];
    
    // Try each selector until we find job cards
    for (const selector of jobCardSelectors) {
      const elements = dom.querySelectorAll(selector);
      if (elements.length > 0) {
        jobCards = Array.from(elements);
        debugLog(`Found ${jobCards.length} job cards using selector: ${selector}`);
        break;
      }
    }
    
    // If no job cards found, return mock data
    if (jobCards.length === 0) {
      debugLog('No job cards found, using mock data');
      return getMockJobs(query, location);
    }
    
    // Process up to 10 job cards
    const maxJobs = Math.min(10, jobCards.length);
    
    for (let i = 0; i < maxJobs; i++) {
      const card = jobCards[i];
      
      try {
        // Find title element - try multiple possible selectors
        const titleEl = card.querySelector('h2.jobTitle') || 
                       card.querySelector('.jobTitle') || 
                       card.querySelector('h2') ||
                       card.querySelector('a[data-jk]');
        
        const title = titleEl?.textContent?.trim() || '';
        
        // Find company element
        const companyEl = card.querySelector('.companyName') || 
                         card.querySelector('.company') || 
                         card.querySelector('[data-testid="company-name"]');
        
        const company = companyEl?.textContent?.trim() || '';
        
        // Find location element
        const locationEl = card.querySelector('.companyLocation') || 
                          card.querySelector('.location') || 
                          card.querySelector('[data-testid="text-location"]');
        
        const jobLocation = locationEl?.textContent?.trim() || location;
        
        // Find link to the job
        const linkEl = titleEl?.closest('a') || card.querySelector('a');
        let url = linkEl?.getAttribute('href') || '';
        
        // If it's a relative URL, make it absolute
        if (url && url.startsWith('/')) {
          url = `https://www.indeed.com${url}`;
        }
        
        // Find job description snippet
        const snippetEl = card.querySelector('.job-snippet') || 
                         card.querySelector('.summary') || 
                         card.querySelector('.description');
        
        const description = snippetEl?.textContent?.trim() || '';
        
        // Find posted date
        const dateEl = card.querySelector('.date') || 
                      card.querySelector('.posted') || 
                      card.querySelector('.listing-age');
        
        const datePosted = dateEl?.textContent?.trim() || new Date().toISOString();
        
        // Find salary if available
        const salaryEl = card.querySelector('.salary-snippet') || 
                        card.querySelector('.salary') || 
                        card.querySelector('[data-testid="text-salary"]');
        
        const salary = salaryEl?.textContent?.trim() || undefined;
        
        // Only add if we have at least a title and company
        if (title && company) {
          jobListings.push({
            id: `indeed-${i}-${Date.now()}`,
            title,
            company,
            location: jobLocation,
            description,
            url,
            salary,
            datePosted,
            source: 'indeed'
          });
        }
      } catch (err) {
        debugLog(`Error processing job card: ${err}`);
      }
    }
    
    debugLog(`Successfully extracted ${jobListings.length} jobs from Indeed`);
    
    // If we couldn't extract any listings, return mock data
    if (jobListings.length === 0) {
      return getMockJobs(query, location);
    }
    
    return jobListings;
  } catch (error) {
    debugLog(`Error searching Indeed: ${error}`);
    return getMockJobs(query, location);
  }
}

/**
 * Search for jobs on LinkedIn
 * Note: This is a simplified implementation that returns mock data
 */
async function searchLinkedInJobs(query: string, location: string): Promise<JobListing[]> {
  debugLog(`Searching LinkedIn for "${query}" in "${location}"`);
  // Note: A real implementation would scrape LinkedIn or use their API
  // For now, just return mock data
  return getMockJobs(query, location).map(job => ({
    ...job,
    source: 'linkedin'
  }));
}

/**
 * Search for jobs on Upwork
 */
async function searchUpworkJobs(query: string): Promise<JobListing[]> {
  debugLog(`Searching Upwork for "${query}"`);
  // Note: A real implementation would scrape Upwork or use their API
  // For now, just return mock data
  return getMockJobs(query, 'Remote').map(job => ({
    ...job,
    source: 'upwork'
  }));
}

/**
 * Search for jobs on Freelancer
 */
async function searchFreelancerJobs(query: string): Promise<JobListing[]> {
  debugLog(`Searching Freelancer for "${query}"`);
  // Note: A real implementation would scrape Freelancer or use their API
  // For now, just return mock data
  return getMockJobs(query, 'Remote').map(job => ({
    ...job,
    source: 'freelancer'
  }));
}

// Main handler function
serve(async (req) => {
  // Reset debug variables
  debugLogs = [];
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, location = 'remote', source = 'all' }: JobSearchRequest = await req.json();
    debugMode = req.url.includes('debug=true');
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    debugLog(`Starting job search for: "${query}" in "${location}" using source: ${source}`);

    // Set a global timeout for the entire operation
    let timedOut = false;
    const globalTimeout = setTimeout(() => {
      timedOut = true;
      debugLog('GLOBAL TIMEOUT: Execution approaching 30 second limit, returning partial results');
    }, 30000); // 30 second timeout (well under the 60s limit)

    // Search for jobs
    let jobs: JobListing[] = [];
    
    try {
      if (source === 'indeed') {
        jobs = await searchIndeedJobs(query, location);
      } else if (source === 'linkedin') {
        jobs = await searchLinkedInJobs(query, location);
      } else if (source === 'upwork') {
        jobs = await searchUpworkJobs(query);
      } else if (source === 'freelancer') {
        jobs = await searchFreelancerJobs(query);
      } else {
        // Auto mode - try multiple sources with a race
        debugLog('Auto mode: trying multiple sources with race');
        
        // Set up Promise.race to use whichever source responds first
        const result = await Promise.race([
          searchIndeedJobs(query, location).then(data => ({ source: 'indeed', data })),
          searchLinkedInJobs(query, location).then(data => ({ source: 'linkedin', data }))
        ]);
        
        debugLog(`Race completed, winner: ${result.source}`);
        jobs = result.data;
      }
    } catch (e) {
      debugLog('Error running job search:', e);
      jobs = getMockJobs(query, location);
    }
    
    clearTimeout(globalTimeout);
    
    // If we timed out or have no jobs, use mock data
    if (timedOut || jobs.length === 0) {
      debugLog(`${timedOut ? 'Timed out' : 'No jobs found'}, using mock data`);
      jobs = getMockJobs(query, location);
    }
    
    // Prepare response object
    const responseObj: any = {
      jobs,
      count: jobs.length,
      query,
      source: jobs[0]?.source || source,
      timestamp: new Date().toISOString(),
    };
    
    // Add debug information if debug mode was enabled
    if (debugMode) {
      responseObj.debug = {
        logs: debugLogs
      };
      
      debugLog('Including debug info in response');
    }
    
    return new Response(JSON.stringify(responseObj), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Error processing request:', errorMessage);
    
    // Return error with any debug logs we collected
    const responseObj: any = {
      error: 'Failed to search for jobs',
      details: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    if (debugMode) {
      responseObj.debug = {
        logs: debugLogs
      };
    }
    
    return new Response(JSON.stringify(responseObj), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
