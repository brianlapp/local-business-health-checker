
// Type definitions for web scraper

export interface ScrapingRequest {
  location: string;
  source?: string;
  debug?: boolean;
}

export interface BusinessData {
  name: string;
  website: string;
  source?: string;
  phone?: string;
}

export interface HtmlSample {
  url: string;
  length: number;
  sample: string;
}

export interface DebugData {
  logs: string[];
  htmlSamples: HtmlSample[];
}

export interface ScraperResponse {
  businesses: BusinessData[];
  count: number;
  location: string;
  source: string;
  timestamp: string;
  debug?: DebugData;
  error?: string;
  details?: string;
}
