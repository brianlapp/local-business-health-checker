
import { supabase } from '@/lib/supabase';

export type ScheduleSettings = {
  scanning_enabled: boolean;
  scan_hour: number;
  scan_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  batch_size: number;
  retry_failed: boolean;
  max_retries: number;
};

/**
 * Get the scanning schedule settings
 */
export async function getScheduleSettings(): Promise<ScheduleSettings> {
  try {
    const { data, error } = await supabase
      .from('automation_settings')
      .select('scanning_enabled, scan_hour, scan_frequency, batch_size, retry_failed, max_retries')
      .single();
    
    if (error) {
      console.error('Error getting schedule settings:', error);
      
      // Return default values
      return {
        scanning_enabled: false,
        scan_hour: 3,
        scan_frequency: 'daily',
        batch_size: 5,
        retry_failed: true,
        max_retries: 3
      };
    }
    
    // Ensure scan_frequency is a valid type
    const validFrequency = (['daily', 'weekly', 'biweekly', 'monthly'] as const).includes(
      data.scan_frequency as any
    ) ? data.scan_frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' 
      : 'daily';
    
    return {
      scanning_enabled: data.scanning_enabled || false,
      scan_hour: data.scan_hour || 3,
      scan_frequency: validFrequency,
      batch_size: data.batch_size || 5,
      retry_failed: data.retry_failed !== false, // Default to true
      max_retries: data.max_retries || 3
    };
  } catch (error) {
    console.error('Error in getScheduleSettings:', error);
    
    // Return default values
    return {
      scanning_enabled: false,
      scan_hour: 3,
      scan_frequency: 'daily',
      batch_size: 5,
      retry_failed: true,
      max_retries: 3
    };
  }
}

/**
 * Update the scanning schedule settings
 */
export async function updateScheduleSettings(settings: ScheduleSettings): Promise<boolean> {
  try {
    // Update the settings in the automation_settings table
    const { error } = await supabase
      .from('automation_settings')
      .update({
        scanning_enabled: settings.scanning_enabled,
        scan_hour: settings.scan_hour,
        scan_frequency: settings.scan_frequency,
        batch_size: settings.batch_size,
        retry_failed: settings.retry_failed,
        max_retries: settings.max_retries,
      })
      // Fix the filter - use a simpler approach since there should only be one record
      .not('id', 'is', null);
    
    if (error) {
      console.error('Error updating schedule settings:', error);
      return false;
    }
    
    // If scanning was enabled, also update the next scheduled scan time
    if (settings.scanning_enabled) {
      const { error: rpcError } = await supabase.rpc('update_next_scan_time');
      
      if (rpcError) {
        console.error('Error updating next scan time:', rpcError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateScheduleSettings:', error);
    return false;
  }
}
