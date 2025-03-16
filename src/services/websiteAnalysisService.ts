
// File: src/services/websiteAnalysisService.ts
// Analyze websites for issues and technical insights

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { generateIssues } from './businessUtilsService';

// Update the database with new website analysis results
export async function updateWebsiteAnalysis(businessId: string, analysisData: {
  lighthouseScore?: number;
  speedScore?: number;
  gtmetrixScore?: number;
  lighthouseReportUrl?: string;
  gtmetrixReportUrl?: string;
  cms?: string;
  is_mobile_friendly?: boolean;
}): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    const updateData: any = {};
    
    // Add fields to update data if they exist
    if (analysisData.lighthouseScore !== undefined) {
      updateData.lighthouse_score = analysisData.lighthouseScore;
      updateData.last_lighthouse_scan = now;
    }
    
    if (analysisData.speedScore !== undefined) {
      updateData.speed_score = analysisData.speedScore;
    }
    
    if (analysisData.gtmetrixScore !== undefined) {
      updateData.gtmetrix_score = analysisData.gtmetrixScore;
      updateData.last_gtmetrix_scan = now;
    }
    
    if (analysisData.lighthouseReportUrl) {
      updateData.lighthouse_report_url = analysisData.lighthouseReportUrl;
    }
    
    if (analysisData.gtmetrixReportUrl) {
      updateData.gtmetrix_report_url = analysisData.gtmetrixReportUrl;
    }
    
    if (analysisData.cms) {
      updateData.cms = analysisData.cms;
    }
    
    if (analysisData.is_mobile_friendly !== undefined) {
      updateData.is_mobile_friendly = analysisData.is_mobile_friendly;
    }
    
    // Always update last_checked timestamp
    updateData.last_checked = now;
    
    const { error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId);
    
    if (error) {
      console.error('Error updating website analysis:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateWebsiteAnalysis:', error);
    return false;
  }
}

// Get scan usage statistics for GTmetrix
export async function getGTMetrixUsage(): Promise<{ used: number, limit: number, resetDate: string | null }> {
  try {
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching GTmetrix usage:', error);
      return { used: 0, limit: 0, resetDate: null };
    }
    
    return {
      used: data.scans_used,
      limit: data.scans_limit,
      resetDate: data.reset_date
    };
  } catch (error) {
    console.error('Error in getGTMetrixUsage:', error);
    return { used: 0, limit: 0, resetDate: null };
  }
}

// Increment GTmetrix usage counter
export async function incrementGTMetrixUsage(): Promise<boolean> {
  try {
    // Get current usage
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching GTmetrix usage:', error);
      return false;
    }
    
    // Update usage count
    const { error: updateError } = await supabase
      .from('gtmetrix_usage')
      .update({
        scans_used: data.scans_used + 1,
        last_updated: new Date().toISOString()
      })
      .eq('id', data.id);
    
    if (updateError) {
      console.error('Error updating GTmetrix usage:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in incrementGTMetrixUsage:', error);
    return false;
  }
}

// Get all businesses that need analysis
export async function getBusinessesForAnalysis(limit: number = 10): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('last_checked', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching businesses for analysis:', error);
      return [];
    }
    
    // Ensure proper return type with required fields
    return data.map(business => ({
      ...business,
      lastChecked: business.last_checked,
      speedScore: business.speed_score,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      lighthouseReportUrl: business.lighthouse_report_url,
      gtmetrixReportUrl: business.gtmetrix_report_url,
      lastLighthouseScan: business.last_lighthouse_scan,
      lastGtmetrixScan: business.last_gtmetrix_scan,
      status: business.status || 'discovered',
      issues: generateIssues(business as Business)
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesForAnalysis:', error);
    return [];
  }
}
