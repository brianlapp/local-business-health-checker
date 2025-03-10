
export interface Business {
  id: string;
  name: string;
  website: string;
  score: number;
  cms?: string;
  speedScore?: number;
  lastChecked?: string;
  issues?: {
    speedIssues: boolean;
    outdatedCMS: boolean;
    noSSL: boolean;
    notMobileFriendly: boolean;
    badFonts: boolean;
  };
}

export const sampleBusinesses: Business[] = [
  {
    id: "1",
    name: "Johnson Plumbing",
    website: "johnsonplumbing.com",
    score: 78,
    cms: "WordPress 5.4",
    speedScore: 32,
    lastChecked: "2023-08-15",
    issues: {
      speedIssues: true,
      outdatedCMS: true,
      noSSL: false,
      notMobileFriendly: true,
      badFonts: true
    }
  },
  {
    id: "2",
    name: "Elite Auto Repair",
    website: "eliteautorepair.biz",
    score: 85,
    cms: "Wix",
    speedScore: 28,
    lastChecked: "2023-08-14",
    issues: {
      speedIssues: true,
      outdatedCMS: true,
      noSSL: true,
      notMobileFriendly: true,
      badFonts: false
    }
  },
  {
    id: "3",
    name: "Town Electricians",
    website: "townelectricians.net",
    score: 62,
    cms: "Joomla 3.8",
    speedScore: 41,
    lastChecked: "2023-08-13",
    issues: {
      speedIssues: true,
      outdatedCMS: true,
      noSSL: false,
      notMobileFriendly: true,
      badFonts: false
    }
  },
  {
    id: "4",
    name: "Smith's Landscaping",
    website: "smithlandscaping.com",
    score: 92,
    cms: "Squarespace",
    speedScore: 22,
    lastChecked: "2023-08-12",
    issues: {
      speedIssues: true,
      outdatedCMS: true,
      noSSL: true,
      notMobileFriendly: true,
      badFonts: true
    }
  },
  {
    id: "5",
    name: "Peterson Law Firm",
    website: "petersonlaw.com",
    score: 45,
    cms: "Custom HTML",
    speedScore: 58,
    lastChecked: "2023-08-11",
    issues: {
      speedIssues: false,
      outdatedCMS: true,
      noSSL: false,
      notMobileFriendly: true,
      badFonts: false
    }
  },
  {
    id: "6",
    name: "City Dental Care",
    website: "citydentalcare.org",
    score: 72,
    cms: "WordPress 5.9",
    speedScore: 37,
    lastChecked: "2023-08-10",
    issues: {
      speedIssues: true,
      outdatedCMS: false,
      noSSL: true,
      notMobileFriendly: false,
      badFonts: true
    }
  }
];
