
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Trigger a manual scan of businesses
 */
export async function triggerManualScan(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('scheduled-scanner', {
      body: { mode: 'manual' }
    });
    
    if (error) {
      console.error('Error triggering manual scan:', error);
      toast.error('Failed to trigger scan');
      return false;
    }
    
    if (data.error) {
      console.error('Scan error:', data.error);
      toast.error(`Failed to trigger scan: ${data.error}`);
      return false;
    }
    
    if (data.message.includes('No businesses')) {
      toast.info('No businesses found that need scanning');
    } else {
      toast.success(`Scanning initiated for ${data.businesses?.length || 0} businesses`);
    }
    
    return true;
  } catch (error) {
    console.error('Error triggering scan:', error);
    toast.error('Failed to trigger scan');
    return false;
  }
}

/**
 * Enable or disable automated scanning
 */
export async function toggleAutomatedScanning(enabled: boolean): Promise<boolean> {
  try {
    // This will turn on/off the cron job in the database
    const { error } = await supabase.rpc('toggle_scanning_schedule', {
      enabled_param: enabled
    });
    
    if (error) {
      console.error('Error toggling scan schedule:', error);
      toast.error('Failed to update scanning schedule');
      return false;
    }
    
    toast.success(enabled ? 'Automated scanning enabled' : 'Automated scanning disabled');
    return true;
  } catch (error) {
    console.error('Error toggling scan schedule:', error);
    toast.error('Failed to update scanning schedule');
    return false;
  }
}

/**
 * Get the current automation status
 */
export async function getAutomationStatus(): Promise<{
  enabled: boolean;
  nextRun: string | null;
  lastRun: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('automation_settings')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error getting automation status:', error);
      return {
        enabled: false,
        nextRun: null,
        lastRun: null
      };
    }
    
    return {
      enabled: data?.scanning_enabled || false,
      nextRun: data?.next_scheduled_scan || null,
      lastRun: data?.last_scan_run || null
    };
  } catch (error) {
    console.error('Error getting automation status:', error);
    return {
      enabled: false,
      nextRun: null,
      lastRun: null
    };
  }
}

/**
 * Get scan queue status
 */
export async function getScanQueueStatus(): Promise<{
  pendingScans: number;
  inProgressScans: number;
  completedToday: number;
  failedToday: number;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get pending scans count
    const { data: pendingData, error: pendingError } = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('status', 'scanning');
    
    if (pendingError) throw pendingError;
    
    // Get today's completed scans
    const { data: completedData, error: completedError } = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .gte('last_checked', today.toISOString())
      .eq('status', 'discovered');
    
    if (completedError) throw completedError;
    
    // Get today's failed scans
    const { data: failedData, error: failedError } = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .gte('last_checked', today.toISOString())
      .eq('status', 'error');
    
    if (failedError) throw failedError;
    
    return {
      pendingScans: pendingData?.length || 0,
      inProgressScans: 0, // We'll implement this when we add queue management
      completedToday: completedData?.length || 0,
      failedToday: failedData?.length || 0
    };
  } catch (error) {
    console.error('Error getting scan queue status:', error);
    return {
      pendingScans: 0,
      inProgressScans: 0,
      completedToday: 0,
      failedToday: 0
    };
  }
}
