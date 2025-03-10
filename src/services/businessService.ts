import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';

export async function getBusinesses(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) throw error;
    
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
      issues: generateIssues(business),
    }));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    toast.error('Failed to load businesses');
    return [];
  }
}

export async function addBusiness(business: Omit<Business, 'id' | 'issues'>): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: business.name,
        website: business.website,
        score: business.score,
        cms: business.cms,
        lighthouse_score: business.lighthouse_score || business.lighthouseScore,
        last_checked: business.last_checked || business.lastChecked,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Business added successfully');
    return {
      ...data,
      lastChecked: data.last_checked,
      speedScore: data.speed_score,
      lighthouseScore: data.lighthouse_score,
      gtmetrixScore: data.gtmetrix_score,
      lighthouseReportUrl: data.lighthouse_report_url,
      gtmetrixReportUrl: data.gtmetrix_report_url,
      lastLighthouseScan: data.last_lighthouse_scan,
      lastGtmetrixScan: data.last_gtmetrix_scan,
      issues: generateIssues(data),
    };
  } catch (error) {
    console.error('Error adding business:', error);
    toast.error('Failed to add business');
    return null;
  }
}

export async function updateBusiness(id: string, updates: Partial<Omit<Business, 'id' | 'issues'>>): Promise<boolean> {
  try {
    const updateData: any = {
      name: updates.name,
      website: updates.website,
      score: updates.score,
      cms: updates.cms,
      last_checked: updates.last_checked || updates.lastChecked,
    };
    
    // Map the new properties to the database column names
    if (updates.lighthouse_score !== undefined || updates.lighthouseScore !== undefined) {
      updateData.lighthouse_score = updates.lighthouse_score || updates.lighthouseScore;
    }
    
    if (updates.gtmetrix_score !== undefined || updates.gtmetrixScore !== undefined) {
      updateData.gtmetrix_score = updates.gtmetrix_score || updates.gtmetrixScore;
    }
    
    if (updates.lighthouse_report_url !== undefined || updates.lighthouseReportUrl !== undefined) {
      updateData.lighthouse_report_url = updates.lighthouse_report_url || updates.lighthouseReportUrl;
    }
    
    if (updates.gtmetrix_report_url !== undefined || updates.gtmetrixReportUrl !== undefined) {
      updateData.gtmetrix_report_url = updates.gtmetrix_report_url || updates.gtmetrixReportUrl;
    }
    
    if (updates.last_lighthouse_scan !== undefined || updates.lastLighthouseScan !== undefined) {
      updateData.last_lighthouse_scan = updates.last_lighthouse_scan || updates.lastLighthouseScan;
    }
    
    if (updates.last_gtmetrix_scan !== undefined || updates.lastGtmetrixScan !== undefined) {
      updateData.last_gtmetrix_scan = updates.last_gtmetrix_scan || updates.lastGtmetrixScan;
    }
    
    const { error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Business updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating business:', error);
    toast.error('Failed to update business');
    return false;
  }
}

export async function scanWithLighthouse(businessId: string, website: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('lighthouse-scan', {
      body: { businessId, url: website },
    });
    
    if (error) throw error;
    
    toast.success('Lighthouse scan completed');
    return data;
  } catch (error) {
    console.error('Error running Lighthouse scan:', error);
    toast.error('Failed to run Lighthouse scan');
    throw error;
  }
}

export async function scanWithGTmetrix(businessId: string, website: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('gtmetrix-scan', {
      body: { businessId, url: website },
    });
    
    if (error) {
      if (error.message.includes('limit reached')) {
        toast.error('Monthly GTmetrix scan limit reached');
        return { error: 'limit_reached', ...error };
      }
      throw error;
    }
    
    toast.success('GTmetrix scan completed');
    return data;
  } catch (error) {
    console.error('Error running GTmetrix scan:', error);
    toast.error('Failed to run GTmetrix scan');
    throw error;
  }
}

export async function getGTmetrixUsage(): Promise<{ used: number, limit: number }> {
  try {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get or create the usage record for this month
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('scans_used, scans_limit')
      .eq('month', currentMonth)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No record for this month yet, which means 0 used
        return { used: 0, limit: 5 };
      }
      throw error;
    }
    
    return { used: data.scans_used, limit: data.scans_limit };
  } catch (error) {
    console.error('Error getting GTmetrix usage:', error);
    return { used: 0, limit: 5 }; // Default fallback
  }
}

function generateIssues(business: any) {
  // Use lighthouse_score as primary, fallback to speed_score, or default to 0
  const speedScore = business.lighthouse_score || business.speed_score || 0;
  
  return {
    speedIssues: speedScore < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: Math.random() > 0.5, // Example placeholder
    badFonts: Math.random() > 0.7, // Example placeholder
  };
}

function isCMSOutdated(cms: string | null | undefined): boolean {
  if (!cms) return false;
  
  const outdatedCMSList = [
    'WordPress 5.4', 'WordPress 5.5', 'WordPress 5.6',
    'Joomla 3.8', 'Joomla 3.9',
    'Drupal 7', 'Drupal 8'
  ];
  
  return outdatedCMSList.some(outdatedCMS => cms.includes(outdatedCMS));
}

function isWebsiteSecure(website: string): boolean {
  return website.startsWith('https://') || !website.startsWith('http://');
}
