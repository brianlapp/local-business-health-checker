
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
