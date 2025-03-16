
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
  lighthouse_score?: number; // For backward compatibility
  gtmetrix_score?: number; // For backward compatibility
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  lighthouse_report_url?: string; // For backward compatibility
  gtmetrix_report_url?: string; // For backward compatibility
  lastLighthouseScan?: string;
  lastGtmetrixScan?: string;
  lastChecked?: string;
  last_checked?: string; // For backward compatibility
  is_mobile_friendly?: boolean;
  opportunityScore?: number;
  opportunity_score?: number; // For backward compatibility
  issues?: {
    speedIssues?: boolean;
    outdatedCMS?: boolean;
    noSSL?: boolean;
    notMobileFriendly?: boolean;
    badFonts?: boolean;
  };
  created_at?: string;
  updated_at?: string;
  source?: string; // Added for compatibility with existing code
}

export interface ScanDebugInfo {
  requestUrl?: string;
  responseHeaders?: Record<string, string>;
  statusCode?: number;
  processingTime?: number;
  parsedElements?: number;
  errors?: string[];
  warnings?: string[];
  logs?: string[]; // For logging in MapScanner.tsx
  htmlSamples?: Array<{url: string, length: number, sample: string}>; // Updated structure
}

export interface BusinessScanResponse {
  businesses: Business[];
  count: number; // Marked as required
  location: string;
  industry?: string;
  error?: string;
  message?: string;
  troubleshooting?: string;
  test_mode?: boolean;
  source?: string; // Added for compatibility
  timestamp?: string; // Added for compatibility
  debugInfo?: ScanDebugInfo; // Added to match usage in scanningService.ts
}
