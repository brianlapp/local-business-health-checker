
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// GTmetrix scanning functionality
export async function scanWithGTmetrix(businessId: string, url: string): Promise<{ success: boolean; reportUrl?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('gtmetrix-scan', {
      body: { url, businessId }
    });

    if (error) throw error;
    
    if (data.error) {
      console.error('GTmetrix scan error:', data.error);
      toast.error(`GTmetrix scan failed: ${data.error}`);
      return { success: false };
    }
    
    return { 
      success: true,
      reportUrl: data.reportUrl || data.report_url
    };
  } catch (error) {
    console.error('Error during GTmetrix scan:', error);
    toast.error('GTmetrix scan failed. Please try again later.');
    return { success: false };
  }
}

// Lighthouse scanning functionality
export async function scanWithLighthouse(businessId: string, url: string): Promise<{ success: boolean; reportUrl?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('lighthouse-scan', {
      body: { url, businessId }
    });

    if (error) throw error;
    
    if (data.error) {
      console.error('Lighthouse scan error:', data.error);
      toast.error(`Lighthouse scan failed: ${data.error}`);
      return { success: false };
    }
    
    return { 
      success: true,
      reportUrl: data.reportUrl || data.report_url
    };
  } catch (error) {
    console.error('Error during Lighthouse scan:', error);
    toast.error('Lighthouse scan failed. Please try again later.');
    return { success: false };
  }
}

// Get GTmetrix usage statistics
export async function getGTmetrixUsage(): Promise<{ used: number; limit: number; resetDate: string }> {
  try {
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      used: data.scans_used || 0,
      limit: data.monthly_limit || 3,
      resetDate: data.reset_date || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching GTmetrix usage:', error);
    return { used: 0, limit: 3, resetDate: new Date().toISOString() };
  }
}
