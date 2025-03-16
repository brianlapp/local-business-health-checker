
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';
import { ensureBusinessStatus } from './businessUtilsService';

/**
 * Get businesses that need to be rescanned based on their last checked date
 */
export async function getBusinessesNeedingRealScores(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .or('lighthouse_score.is.null,gtmetrix_score.is.null')
      .limit(20);
    
    if (error) {
      console.error('Error fetching businesses needing scores:', error);
      toast.error('Failed to fetch businesses needing scores');
      return [];
    }
    
    // Use our utility function to ensure all businesses have the required fields
    return (data || []).map(business => ensureBusinessStatus(business));
  } catch (error) {
    console.error('Error in getBusinessesNeedingRealScores:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

/**
 * Get GTmetrix usage statistics
 */
export async function getGTmetrixUsage(): Promise<{ scans_used: number; scan_limit: number; } | null> {
  try {
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching GTmetrix usage:', error);
      toast.error('Failed to fetch GTmetrix usage');
      return null;
    }
    
    // Map the database column names to our client-expected names
    return data ? {
      scans_used: data.scans_used,
      scan_limit: data.scans_limit
    } : null;
  } catch (error) {
    console.error('Error in getGTmetrixUsage:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

/**
 * Queue a business for Lighthouse scanning
 */
export async function scanWithLighthouse(businessId: string): Promise<boolean> {
  try {
    // Get the business to scan
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('website')
      .eq('id', businessId)
      .single();
    
    if (businessError || !business) {
      console.error('Error fetching business for scan:', businessError);
      toast.error('Business not found');
      return false;
    }
    
    // Use a direct SQL query to call the RPC since TypeScript doesn't know about our custom functions
    const { data, error } = await supabase.rpc(
      'add_to_scan_queue' as any,
      {
        business_id_param: businessId,
        scan_type_param: 'lighthouse',
        url_param: business.website,
        priority_param: 'high'
      }
    );
    
    if (error) {
      console.error('Error queuing Lighthouse scan:', error);
      toast.error('Failed to queue Lighthouse scan');
      return false;
    }
    
    toast.success('Lighthouse scan queued');
    return true;
  } catch (error) {
    console.error('Error in scanWithLighthouse:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Queue a business for GTmetrix scanning
 */
export async function scanWithGTmetrix(businessId: string): Promise<boolean> {
  try {
    // Get the business to scan
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('website')
      .eq('id', businessId)
      .single();
    
    if (businessError || !business) {
      console.error('Error fetching business for scan:', businessError);
      toast.error('Business not found');
      return false;
    }
    
    // Use a direct SQL query to call the RPC since TypeScript doesn't know about our custom functions
    const { data, error } = await supabase.rpc(
      'add_to_scan_queue' as any,
      {
        business_id_param: businessId,
        scan_type_param: 'gtmetrix',
        url_param: business.website,
        priority_param: 'high'
      }
    );
    
    if (error) {
      console.error('Error queuing GTmetrix scan:', error);
      toast.error('Failed to queue GTmetrix scan');
      return false;
    }
    
    toast.success('GTmetrix scan queued');
    return true;
  } catch (error) {
    console.error('Error in scanWithGTmetrix:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Queue a business for BuiltWith technology lookup
 */
export async function scanWithBuiltWith(businessId: string): Promise<boolean> {
  try {
    // Get the business to scan
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('website')
      .eq('id', businessId)
      .single();
    
    if (businessError || !business) {
      console.error('Error fetching business for scan:', businessError);
      toast.error('Business not found');
      return false;
    }
    
    // Use a direct SQL query to call the RPC since TypeScript doesn't know about our custom functions
    const { data, error } = await supabase.rpc(
      'add_to_scan_queue' as any,
      {
        business_id_param: businessId,
        scan_type_param: 'builtwith',
        url_param: business.website,
        priority_param: 'high'
      }
    );
    
    if (error) {
      console.error('Error queuing BuiltWith scan:', error);
      toast.error('Failed to queue BuiltWith scan');
      return false;
    }
    
    toast.success('BuiltWith scan queued');
    return true;
  } catch (error) {
    console.error('Error in scanWithBuiltWith:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}
