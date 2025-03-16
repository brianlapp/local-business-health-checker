import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';

// Add status field to the business type to fix the type error
interface ScanSettings {
  id?: string;
  scanning_enabled: boolean;
  next_scheduled_scan: string | null;
  last_scan_run: string | null;
  scan_interval: string;
}

interface ScanQueueStatus {
  pendingScans: number;
  inProgressScans: number;
  completedToday: number;
  failedToday: number;
}

interface AutomationStatus {
  enabled: boolean;
  nextRun: string | null;
  lastRun: string | null;
}

/**
 * Get current scanning automation settings
 */
export async function getScanAutomationSettings(): Promise<ScanSettings | null> {
  try {
    const { data, error } = await supabase
      .from('automation_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default
        return createDefaultSettings();
      }
      console.error('Error fetching scan settings:', error);
      return null;
    }
    
    return data as ScanSettings;
  } catch (error) {
    console.error('Error in getScanAutomationSettings:', error);
    return null;
  }
}

/**
 * Create default settings if none exist
 */
async function createDefaultSettings(): Promise<ScanSettings | null> {
  try {
    const defaultSettings = {
      scanning_enabled: false,
      next_scheduled_scan: null,
      last_scan_run: null,
      scan_interval: '0 3 * * *', // 3 AM every day
    };
    
    const { data, error } = await supabase
      .from('automation_settings')
      .insert(defaultSettings)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default scan settings:', error);
      return null;
    }
    
    return data as ScanSettings;
  } catch (error) {
    console.error('Error in createDefaultSettings:', error);
    return null;
  }
}

/**
 * Update scanning automation settings
 */
export async function updateScanAutomationSettings(settings: Partial<ScanSettings>): Promise<boolean> {
  try {
    // Get current settings
    const currentSettings = await getScanAutomationSettings();
    
    if (!currentSettings) {
      console.error('Failed to fetch current settings');
      return false;
    }
    
    // If toggling scanning_enabled, use the database function to calculate the next scan time properly
    if (settings.scanning_enabled !== undefined && 
        settings.scanning_enabled !== currentSettings.scanning_enabled) {
      const { data, error } = await supabase.rpc(
        'toggle_scanning_schedule', 
        { enabled_param: settings.scanning_enabled }
      );
      
      if (error) {
        console.error('Error toggling scanning schedule:', error);
        return false;
      }
      
      // Return true if the function executed successfully
      return true;
    }
    
    // Otherwise update normally
    const { error } = await supabase
      .from('automation_settings')
      .update({
        scanning_enabled: settings.scanning_enabled ?? currentSettings.scanning_enabled,
        scan_interval: settings.scan_interval ?? currentSettings.scan_interval,
        // Only update next_scheduled_scan if explicitly provided
        ...(settings.next_scheduled_scan !== undefined ? 
          { next_scheduled_scan: settings.next_scheduled_scan } : {})
      })
      .eq('id', currentSettings.id);
    
    if (error) {
      console.error('Error updating scan settings:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateScanAutomationSettings:', error);
    return false;
  }
}

/**
 * Record a scan run
 */
export async function recordScanRun(): Promise<boolean> {
  try {
    // Get current settings
    const currentSettings = await getScanAutomationSettings();
    
    if (!currentSettings) {
      console.error('Failed to fetch current settings');
      return false;
    }
    
    // Update last_scan_run and trigger update of next_scheduled_scan
    const { error } = await supabase.rpc('update_next_scan_time');
    
    if (error) {
      console.error('Error updating next scan time:', error);
      return false;
    }
    
    // Update last_scan_run
    const { error: updateError } = await supabase
      .from('automation_settings')
      .update({
        last_scan_run: new Date().toISOString()
      })
      .eq('id', currentSettings.id);
    
    if (updateError) {
      console.error('Error updating last scan run:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordScanRun:', error);
    return false;
  }
}

/**
 * Get businesses that need scanning
 */
export async function getBusinessesToScan(limit: number = 10): Promise<Business[]> {
  try {
    // Get businesses with oldest checks first
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('last_checked', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching businesses to scan:', error);
      return [];
    }
    
    // Ensure returned businesses have correct structure
    return data.map(business => ({
      ...business,
      // Convert database columns to camelCase properties
      lastChecked: business.last_checked,
      lighthouseScore: business.lighthouse_score,
      gtmetrixScore: business.gtmetrix_score,
      status: business.status || 'discovered',
    })) as Business[];
  } catch (error) {
    console.error('Error in getBusinessesToScan:', error);
    return [];
  }
}

/**
 * Get the current automation status
 */
export async function getAutomationStatus(): Promise<AutomationStatus> {
  try {
    const settings = await getScanAutomationSettings();
    
    if (!settings) {
      return { enabled: false, nextRun: null, lastRun: null };
    }
    
    return {
      enabled: settings.scanning_enabled,
      nextRun: settings.next_scheduled_scan,
      lastRun: settings.last_scan_run
    };
  } catch (error) {
    console.error('Error getting automation status:', error);
    return { enabled: false, nextRun: null, lastRun: null };
  }
}

/**
 * Toggle automated scanning
 */
export async function toggleAutomatedScanning(enabled: boolean): Promise<boolean> {
  try {
    return await updateScanAutomationSettings({ scanning_enabled: enabled });
  } catch (error) {
    console.error('Error toggling automated scanning:', error);
    return false;
  }
}

/**
 * Trigger a manual scan
 */
export async function triggerManualScan(): Promise<boolean> {
  try {
    // Here we would normally trigger the scan process
    // For this implementation, we'll just record that a scan was run
    toast.success('Manual scan triggered');
    return await recordScanRun();
  } catch (error) {
    console.error('Error triggering manual scan:', error);
    return false;
  }
}

/**
 * Get scan queue status
 */
export async function getScanQueueStatus(): Promise<ScanQueueStatus> {
  try {
    // In a real implementation, we would query the database for actual statistics
    // For now, return sample values
    return {
      pendingScans: 2,
      inProgressScans: 1,
      completedToday: 15,
      failedToday: 3
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

/**
 * Update business status
 */
export async function updateBusinessStatus(businessId: string, status: string): Promise<boolean> {
  try {
    console.log(`Updating business ${businessId} to status: ${status}`);
    
    // Update the business status in the database
    const { error } = await supabase
      .from('businesses')
      .update({ 
        status: status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', businessId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating business status:', error);
    return false;
  }
}
