
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type ScanQueueItem = {
  id: string;
  business_id: string | null;
  scan_type: string;
  url: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
};

/**
 * Add a business to the scan queue
 */
export async function addToScanQueue(
  businessId: string,
  scanType: string,
  url: string | null = null,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<string | null> {
  try {
    // Use a PostgreSQL function call instead of RPC
    const { data, error } = await supabase
      .from('scan_queue')
      .insert({
        business_id: businessId,
        scan_type: scanType,
        url: url,
        priority: priority,
        status: 'pending'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error adding to scan queue:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error in addToScanQueue:', error);
    return null;
  }
}

/**
 * Get scan queue items with optional filtering
 */
export async function getScanQueueItems(filters?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  businessId?: string;
  limit?: number;
}): Promise<ScanQueueItem[]> {
  try {
    let query = supabase
      .from('scan_queue')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.businessId) {
      query = query.eq('business_id', filters.businessId);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as ScanQueueItem[];
  } catch (error) {
    console.error('Error getting scan queue items:', error);
    return [];
  }
}

/**
 * Retry a failed scan
 */
export async function retryScan(scanId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('scan_queue')
      .update({
        status: 'pending',
        error: null,
        started_at: null,
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', scanId)
      .eq('status', 'failed')
      .select()
      .single();
    
    if (error) {
      console.error('Error retrying scan:', error);
      toast.error('Failed to retry scan');
      return false;
    }
    
    toast.success('Scan has been queued for retry');
    return true;
  } catch (error) {
    console.error('Error in retryScan:', error);
    toast.error('Failed to retry scan');
    return false;
  }
}

/**
 * Cancel a pending scan
 */
export async function cancelScan(scanId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scan_queue')
      .delete()
      .eq('id', scanId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error canceling scan:', error);
      toast.error('Failed to cancel scan');
      return false;
    }
    
    toast.success('Scan canceled successfully');
    return true;
  } catch (error) {
    console.error('Error in cancelScan:', error);
    toast.error('Failed to cancel scan');
    return false;
  }
}
