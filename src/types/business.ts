
export interface Business {
  id: string;
  name: string;
  website: string;
  score: number;
  speedScore?: number;
  lighthouseScore?: number;
  gtmetrixScore?: number;
  last_checked: string; // Database column name
  lastChecked: string;  // Frontend property name
  cms?: string | null;
  is_mobile_friendly?: boolean; // Mobile-friendly flag
  issues: {
    speedIssues: boolean;
    outdatedCMS: boolean;
    noSSL: boolean;
    notMobileFriendly: boolean;
    badFonts: boolean;
  };
  lighthouseReportUrl?: string | null;
  gtmetrixReportUrl?: string | null;
  lastLighthouseScan?: string | null;
  lastGtmetrixScan?: string | null;
  source?: string;
  has_real_score?: boolean;
  
  // Adding database column names as optional properties to fix type issues
  speed_score?: number;
  lighthouse_score?: number;
  gtmetrix_score?: number;
  lighthouse_report_url?: string | null;
  gtmetrix_report_url?: string | null;
  last_lighthouse_scan?: string | null;
  last_gtmetrix_scan?: string | null;
}

export interface ScanDebugInfo {
  logs: string[];
  htmlSamples?: { url: string; sample: string; length: number; }[];
}

export interface BusinessScanResponse {
  businesses: Business[];
  count: number;
  location: string;
  source: string;
  timestamp: string;
  test_mode?: boolean;
  error?: string;
  message?: string;
  troubleshooting?: string;
  debugInfo?: ScanDebugInfo;
}
