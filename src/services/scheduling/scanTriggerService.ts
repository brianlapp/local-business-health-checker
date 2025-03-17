
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Trigger a manual scan of businesses
 */
export async function triggerManualScan(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('scheduled-scanner', {
      body: { 
        triggeredManually: true,
        scanType: 'website' 
      }
    });
    
    if (error) {
      console.error('Error triggering scan:', error);
      toast.error('Failed to trigger scan');
      return false;
    }
    
    if (data.error) {
      console.error('Scan error:', data.error);
      toast.error(data.error);
      return false;
    }
    
    if (data.queued) {
      toast.success(`Scan queued: ${data.queued} businesses`);
      return true;
    }
    
    toast.info('No businesses need scanning at this time');
    return true;
  } catch (error) {
    console.error('Error in triggerManualScan:', error);
    toast.error('Failed to trigger scan');
    return false;
  }
}

/**
 * Manually scan a specific business
 */
export async function manuallyRescanBusiness(businessId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('scheduled-scanner', {
      body: { 
        triggeredManually: true,
        businessId: businessId
      }
    });
    
    if (error) {
      console.error('Error scanning business:', error);
      toast.error('Failed to scan business');
      return false;
    }
    
    if (data.error) {
      console.error('Scan error:', data.error);
      toast.error(data.error);
      return false;
    }
    
    toast.success('Business scan initiated');
    return true;
  } catch (error) {
    console.error('Error in manuallyRescanBusiness:', error);
    toast.error('Failed to scan business');
    return false;
  }
}
