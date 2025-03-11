
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
  // This will be used for UI display purposes only
  source?: string;
}

// Debug information interface for the scan results
export interface ScanDebugInfo {
  logs: string[];
  htmlSamples?: {url: string, length: number, sample: string}[];
  timestamp?: string;
  stats?: {
    total?: number;
    unique?: number;
    sources?: {
      yellowpages?: {
        count?: number;
        success?: boolean;
        duration?: string;
        error?: string;
      };
      localstack?: {
        count?: number;
        success?: boolean;
        duration?: string;
        error?: string;
      };
      mock?: {
        count?: number;
        used?: boolean;
      };
    };
  };
}

// Extended response that can include debug information
export interface BusinessScanResponse {
  businesses: Business[];
  count?: number;
  location?: string;
  source?: string;
  timestamp?: string;
  debugInfo?: ScanDebugInfo;
}
