export interface Business {
  id: string;
  name: string;
  website: string;
  score: number;
  speedScore?: number;
  lighthouseScore?: number;
  gtmetrixScore?: number;
  last_checked: string;
  lastChecked: string;
  cms?: string | null;
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
