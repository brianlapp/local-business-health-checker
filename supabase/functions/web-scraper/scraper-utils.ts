
// @deno-types="https://deno.land/std@0.168.0/http/server.d.ts"
import { DebugData, HtmlSample } from "./types.ts";

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Debug variables
let debugLogs: string[] = [];
let htmlSamples: HtmlSample[] = [];
let debugMode = false;

// Reset debug data
export function resetDebugData(): void {
  debugLogs = [];
  htmlSamples = [];
}

// Set debug mode
export function setDebugMode(mode: boolean): void {
  debugMode = mode;
}

// Check if debug mode is enabled
export function isDebugMode(): boolean {
  return debugMode;
}

// Enhanced logging function that captures logs for debugging
export function debugLog(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = data 
    ? `${timestamp} | ${message}: ${typeof data === 'object' ? JSON.stringify(data) : data}`
    : `${timestamp} | ${message}`;
  
  console.log(logMessage);
  
  if (debugMode) {
    debugLogs.push(logMessage);
  }
}

// Function to capture HTML samples for debugging
export function captureHtmlSample(url: string, html: string): void {
  if (!debugMode) return;
  
  // Only store a reasonable sample (first 1000 chars to save space)
  const sample = html.substring(0, 1000) + '... [truncated]';
  
  htmlSamples.push({
    url,
    length: html.length,
    sample
  });
  
  debugLog(`Captured HTML sample from ${url}, total length: ${html.length} characters`);
}

// Get debug data
export function getDebugData(): DebugData {
  return {
    logs: debugLogs,
    htmlSamples: htmlSamples
  };
}

// Pool of user agents to rotate through to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Get a random user agent from the pool
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Enhanced browser-like headers to better avoid detection
export function getBrowserLikeHeaders(): Record<string, string> {
  const userAgent = getRandomUserAgent();
  const referer = 'https://www.google.com/';
  
  return {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': referer,
    'Cache-Control': 'max-age=0',
  };
}
