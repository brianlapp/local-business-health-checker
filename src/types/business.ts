
export interface Business {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  status: 'discovered' | 'contacted' | 'responded' | 'meeting' | 'proposal' | 'client' | 'lost';
  potential_value?: number;
  score?: number;
  cms?: string;
  speedScore?: number;
  lighthouseScore?: number;
  gtmetrixScore?: number;
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  lastLighthouseScan?: string;
  lastGtmetrixScan?: string;
  lastChecked?: string;
  last_checked?: string;
  is_mobile_friendly?: boolean;
  issues?: {
    speedIssues?: boolean;
    outdatedCMS?: boolean;
    noSSL?: boolean;
    notMobileFriendly?: boolean;
    badFonts?: boolean;
  };
}

export interface ScanDebugInfo {
  requestUrl?: string;
  responseHeaders?: Record<string, string>;
  statusCode?: number;
  processingTime?: number;
  parsedElements?: number;
  errors?: string[];
  warnings?: string[];
}

export interface BusinessScanResponse {
  businesses: Business[];
  count: number;
  location: string;
  industry?: string;
  error?: string;
  message?: string;
  test_mode?: boolean;
  troubleshooting?: string;
  source?: string;
  debugInfo?: ScanDebugInfo;
}
