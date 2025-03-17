
import { supabase } from '@/lib/supabase';

/**
 * Update the next scheduled scan time based on current settings
 */
export async function updateNextScanTime(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('update_next_scan_time');
    
    if (error) {
      console.error('Error updating next scan time:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateNextScanTime:', error);
    return false;
  }
}

/**
 * Toggle the scanning schedule on or off
 */
export async function toggleScanningSchedule(enabled: boolean): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('toggle_scanning_schedule', {
      enabled_param: enabled
    });
    
    if (error) {
      console.error('Error toggling scanning schedule:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in toggleScanningSchedule:', error);
    return false;
  }
}

/**
 * Delete all businesses (dangerous operation)
 */
export async function checkDeleteAllBusinessesRpc(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('delete_all_businesses');
    
    if (error && error.message.includes('function "delete_all_businesses" does not exist')) {
      console.error('The delete_all_businesses RPC function does not exist yet.');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking RPC:', error);
    return false;
  }
}
