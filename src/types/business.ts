
export interface Business {
  id: string;
  name: string;
  website: string;
  score: number;
  cms?: string;
  speed_score?: number;
  last_checked?: string;
  
  // Dual scanning system fields
  lighthouse_score?: number;
  gtmetrix_score?: number;
  lighthouse_report_url?: string;
  gtmetrix_report_url?: string;
  last_lighthouse_scan?: string;
  last_gtmetrix_scan?: string;
  
  // Frontend property aliases (camelCase versions)
  speedScore?: number;
  lastChecked?: string;
  lighthouseScore?: number;
  gtmetrixScore?: number;
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  lastLighthouseScan?: string;
  lastGtmetrixScan?: string;
  
  // Business issue tracking
  issues?: {
    speedIssues: boolean;
    outdatedCMS: boolean;
    noSSL: boolean;
    notMobileFriendly: boolean;
    badFonts: boolean;
  };
  
  // Source information (not stored in database)
  // This is used only for UI display purposes
  source?: string;
}
