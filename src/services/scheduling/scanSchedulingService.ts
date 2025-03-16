
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type AutomationStatus = {
  enabled: boolean;
  nextRun: string | null;
  lastRun: string | null;
};

export type ScanQueueStatus = {
  pendingScans: number;
  inProgressScans: number;
  completedToday: number;
  failedToday: number;
};

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

/**
 * Get the status of the scan queue
 */
export async function getScanQueueStatus(): Promise<ScanQueueStatus> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For scan queue status, we'll query the scan_queue table directly
    const { data, error } = await supabase
      .from('scan_queue')
      .select('status')
      .is('completed_at', null);
    
    if (error) {
      console.error('Error getting scan queue status:', error);
      return {
        pendingScans: 0,
        inProgressScans: 0,
        completedToday: 0,
        failedToday: 0
      };
    }
    
    // Count the number of pending and in-progress scans
    const pending = data.filter(scan => scan.status === 'pending').length;
    const inProgress = data.filter(scan => scan.status === 'processing').length;
    
    // Get completed scans today
    const { data: completedData, error: completedError } = await supabase
      .from('scan_queue')
      .select('id')
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString());
    
    // Get failed scans today
    const { data: failedData, error: failedError } = await supabase
      .from('scan_queue')
      .select('id')
      .eq('status', 'failed')
      .gte('updated_at', today.toISOString());
    
    return {
      pendingScans: pending,
      inProgressScans: inProgress,
      completedToday: completedError ? 0 : (completedData?.length || 0),
      failedToday: failedError ? 0 : (failedData?.length || 0)
    };
  } catch (error) {
    console.error('Error in getScanQueueStatus:', error);
    return {
      pendingScans: 0,
      inProgressScans: 0,
      completedToday: 0,
      failedToday: 0
    };
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
