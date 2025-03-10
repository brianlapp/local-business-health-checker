
export interface Business {
  id: string;
  name: string;
  website: string;
  score: number;
  cms?: string;
  speedScore?: number;
  lastChecked?: string;
  
  // New fields for the dual scanning system
  lighthouseScore?: number;
  gtmetrixScore?: number;
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  lastLighthouseScan?: string;
  lastGtmetrixScan?: string;
  
  issues?: {
    speedIssues: boolean;
    outdatedCMS: boolean;
    noSSL: boolean;
    notMobileFriendly: boolean;
    badFonts: boolean;
  };
}
