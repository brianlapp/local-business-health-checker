
import { JobListing } from '@/types/opportunity';
import { addDays, subDays } from 'date-fns';

/**
 * Generate mock job listings for development and testing
 */
export function generateMockJobs(query: string, location: string, count: number = 20): JobListing[] {
  const now = new Date();
  const skills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'HTML', 'CSS', 
    'UI/UX', 'Figma', 'Next.js', 'GraphQL', 'REST APIs', 'Vue.js',
    'Angular', 'WordPress', 'PHP', 'Laravel', 'Shopify', 'Python',
    'Django', 'Flask', 'SQL', 'MongoDB', 'Firebase', 'AWS',
    'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Svelte'
  ];
  
  const titles = [
    'Frontend Developer', 'UI Designer', 'Full Stack Engineer', 'React Developer',
    'WordPress Developer', 'Shopify Expert', 'UX Designer', 'JavaScript Developer',
    'Web Developer', 'E-commerce Specialist', 'Mobile App Developer', 'Landing Page Designer',
    'SEO Specialist', 'Email Marketing Expert', 'Content Creator', 'Digital Marketing Specialist'
  ];
  
  const companies = [
    'TechCorp', 'DigitalWave', 'CodeCrafters', 'WebWizards', 'PixelPerfect',
    'InnovateX', 'ByteBuilders', 'DataDynamo', 'FrontierTech', 'CloudComputing',
    'NexGen Solutions', 'QuantumCode', 'VirtualVisions', 'CyberSystems', 'EpicApps'
  ];
  
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Project-based'];
  
  const descriptions = [
    `We're looking for a talented ${query} expert to join our team. This role involves working on exciting projects for our clients in the ${location} area.`,
    `Seeking a skilled ${query} professional to help build our next-generation platform. Experience with modern frameworks and tools is a must.`,
    `Join our innovative team as a ${query} specialist. You'll be working on cutting-edge projects that push the boundaries of what's possible.`,
    `We need a creative ${query} expert who can bring fresh ideas to our projects. This is a chance to work with a dynamic team in ${location}.`,
    `Looking for an experienced ${query} professional to help us deliver high-quality solutions to our clients. Remote work is possible.`
  ];
  
  const budgetRanges = [
    { min: 30, max: 50 },
    { min: 40, max: 60 },
    { min: 50, max: 75 },
    { min: 75, max: 100 },
    { min: 100, max: 150 },
    { min: 150, max: 200 },
  ];
  
  const sources = ['Upwork', 'Freelancer', 'Fiverr', 'LinkedIn', 'Indeed', 'Remote OK', 'We Work Remotely'];
  
  return Array.from({ length: count }).map((_, index) => {
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const randomBudgetRange = budgetRanges[Math.floor(Math.random() * budgetRanges.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    // Select 3-6 random skills
    const randomSkillsCount = Math.floor(Math.random() * 4) + 3;
    const randomSkills = new Set<string>();
    
    // Always include the query term if it matches a skill
    const queryLower = query.toLowerCase();
    const matchingSkill = skills.find(skill => skill.toLowerCase().includes(queryLower));
    if (matchingSkill) {
      randomSkills.add(matchingSkill);
    }
    
    // Add random skills until we reach the desired count
    while (randomSkills.size < randomSkillsCount) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      randomSkills.add(skill);
    }
    
    // Randomize the date posted (between 14 days ago and 2 days in the future)
    const daysOffset = Math.floor(Math.random() * 16) - 14;
    const datePosted = daysOffset >= 0 ? 
      addDays(now, daysOffset).toISOString() : 
      subDays(now, Math.abs(daysOffset)).toISOString();
    
    // Random hourly rate based on budget range
    const hourlyRate = `$${randomBudgetRange.min}-${randomBudgetRange.max}/hr`;
    
    return {
      id: `mock-job-${index}`,
      title: randomTitle,
      company: randomCompany,
      description: randomDescription,
      url: `https://example.com/jobs/${index}`,
      location: location === 'remote' ? 'Remote' : location,
      is_remote: location === 'remote',
      job_type: randomJobType,
      salary: hourlyRate,
      budget_min: randomBudgetRange.min,
      budget_max: randomBudgetRange.max,
      skills: Array.from(randomSkills),
      datePosted,
      source: randomSource
    };
  });
}
