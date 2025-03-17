
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type AutomationStatus = {
  enabled: boolean;
  nextRun: string | null;
  lastRun: string | null;
};

/**
 * Toggle automated scanning on or off
 */
export async function toggleAutomatedScanning(enabled: boolean): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('toggle_scanning_schedule', {
      enabled_param: enabled
    });
    
    if (error) {
      console.error('Error toggling scanning:', error);
      toast.error('Failed to update automation settings');
      return false;
    }
    
    toast.success(`Automated scanning ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    console.error('Error in toggleAutomatedScanning:', error);
    toast.error('Failed to update automation settings');
    return false;
  }
}

/**
 * Get the current status of automated scanning
 */
export async function getAutomationStatus(): Promise<AutomationStatus> {
  try {
    const { data, error } = await supabase
      .from('automation_settings')
      .select('scanning_enabled, next_scheduled_scan, last_scan_run')
      .single();
    
    if (error) {
      console.error('Error getting automation status:', error);
      return { enabled: false, nextRun: null, lastRun: null };
    }
    
    return {
      enabled: data.scanning_enabled || false,
      nextRun: data.next_scheduled_scan,
      lastRun: data.last_scan_run
    };
  } catch (error) {
    console.error('Error in getAutomationStatus:', error);
    return { enabled: false, nextRun: null, lastRun: null };
  }
}
