
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
