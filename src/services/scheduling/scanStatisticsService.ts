
import { supabase } from '@/lib/supabase';

export type ScanQueueStatus = {
  pendingScans: number;
  inProgressScans: number;
  completedToday: number;
  failedToday: number;
};

/**
 * Get the status of the scan queue
 */
export async function getScanQueueStatus(): Promise<ScanQueueStatus> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch pending scans
    const { count: pendingScans, error: pendingError } = await supabase
      .from('scan_queue' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    // Fetch in-progress scans
    const { count: inProgressScans, error: inProgressError } = await supabase
      .from('scan_queue' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');
    
    // Fetch completed scans today
    const { count: completedToday, error: completedError } = await supabase
      .from('scan_queue' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString());
    
    // Fetch failed scans today
    const { count: failedToday, error: failedError } = await supabase
      .from('scan_queue' as any)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('updated_at', today.toISOString());
    
    if (pendingError || inProgressError || completedError || failedError) {
      console.error('Error getting scan queue status:', 
        pendingError || inProgressError || completedError || failedError);
      
      // Return default values
      return {
        pendingScans: 0,
        inProgressScans: 0,
        completedToday: 0,
        failedToday: 0
      };
    }
    
    return {
      pendingScans: pendingScans || 0,
      inProgressScans: inProgressScans || 0,
      completedToday: completedToday || 0,
      failedToday: failedToday || 0
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
