
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

// NEW: BuiltWith scanning functionality to detect CMS and technology stack
export async function scanWithBuiltWith(businessId: string, url: string): Promise<{ success: boolean; cms?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('builtwith-scan', {
      body: { url, businessId }
    });

    if (error) throw error;
    
    if (data.error) {
      console.error('BuiltWith scan error:', data.error);
      toast.error(`Technology detection failed: ${data.error}`);
      return { success: false };
    }
    
    return { 
      success: true,
      cms: data.cms
    };
  } catch (error) {
    console.error('Error during BuiltWith scan:', error);
    toast.error('Technology detection failed. Please try again later.');
    return { success: false };
  }
}

// Get GTmetrix usage statistics
export async function getGTmetrixUsage(): Promise<{ used: number; limit: number; resetDate: string }> {
  try {
    // First try to get the GTmetrix usage record
    let { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // If there's no record or an error, create a default one
    if (error || !data || data.length === 0) {
      console.log('No GTmetrix usage records found, creating default');
      
      // Get current month in YYYY-MM format
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Insert a default record
      const { data: newRecord, error: insertError } = await supabase
        .from('gtmetrix_usage')
        .insert({
          month: currentMonth,
          scans_used: 0,
          scans_limit: 3,
          reset_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating GTmetrix usage record:', insertError);
        return { used: 0, limit: 3, resetDate: new Date().toISOString() };
      }
      
      data = [newRecord];
    }
    
    const record = data[0];
    
    return {
      used: record.scans_used || 0,
      limit: record.scans_limit || 3,
      resetDate: record.reset_date || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching GTmetrix usage:', error);
    return { used: 0, limit: 3, resetDate: new Date().toISOString() };
  }
}
