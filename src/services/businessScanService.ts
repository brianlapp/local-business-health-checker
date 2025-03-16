
// This file contains all the scanning functionality for businesses

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { invokeEdgeFunction } from './api/supabaseApiClient';

// GTmetrix scanning functionality
export async function scanWithGTmetrix(businessId: string, url: string): Promise<{ success: boolean; reportUrl?: string }> {
  try {
    // Try to call the actual GTmetrix API
    try {
      const { data, error } = await supabase.functions.invoke('gtmetrix-scan', {
        body: { url, businessId }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success('GTmetrix scan completed!');
      
      return { 
        success: true,
        reportUrl: data.reportUrl || data.report_url
      };
    } catch (apiError) {
      console.error('GTmetrix API error:', apiError);
      toast.error('GTmetrix API unavailable. Please try again later.');
      return { success: false };
    }
  } catch (error) {
    console.error('Error during GTmetrix scan:', error);
    toast.error('GTmetrix scan failed. Please try again later.');
    return { success: false };
  }
}

// Helper function to increment GTmetrix usage count
async function incrementGTmetrixUsage() {
  try {
    // Get current month in YYYY-MM format
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current usage
    const { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .eq('month', currentMonth)
      .single();
    
    if (error || !data) {
      // Create new record if none exists
      await supabase
        .from('gtmetrix_usage')
        .insert({
          month: currentMonth,
          scans_used: 1,
          scans_limit: 3,
          reset_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString()
        });
    } else {
      // Update existing record
      await supabase
        .from('gtmetrix_usage')
        .update({
          scans_used: data.scans_used + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', data.id);
    }
  } catch (error) {
    console.error('Error updating GTmetrix usage:', error);
  }
}

// Lighthouse scanning functionality - with proper rate limit handling
export async function scanWithLighthouse(businessId: string, url: string): Promise<{ 
  success: boolean; 
  reportUrl?: string; 
  note?: string;
  isRealScore?: boolean;
}> {
  try {
    // Add the business to the scan queue instead of scanning directly
    const { data: queueData, error: queueError } = await supabase
      .from('scan_queue')
      .insert({
        business_id: businessId,
        scan_type: 'lighthouse',
        url: url,
        status: 'pending',
        priority: 'medium'
      })
      .select('id')
      .single();
    
    if (queueError) {
      console.error('Error adding to scan queue:', queueError);
      
      // Fall back to direct scanning for backward compatibility
      const { data, error } = await supabase.functions.invoke('lighthouse-scan', {
        body: { url, businessId }
      });

      if (error) {
        console.error('Lighthouse invoke error:', error);
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || (data && data.status === 429)) {
          const note = data?.note || "Rate limited. Please try again later.";
          toast.warning(note);
          return { 
            success: false,
            note: note
          };
        }
        
        toast.error(`Lighthouse scan failed: ${error.message}`);
        return { success: false };
      }
      
      if (data.error) {
        console.error('Lighthouse scan error:', data.error);
        
        // Check if it's a rate limit error
        if (data.note && data.note.includes('rate limited')) {
          toast.warning(data.note);
          return { 
            success: false,
            note: data.note
          };
        }
        
        toast.error(`Lighthouse scan failed: ${data.error}`);
        return { success: false };
      }
      
      toast.success('Lighthouse scan completed!');
      
      return { 
        success: true,
        reportUrl: data.reportUrl,
        note: data.note
      };
    }
    
    // Successfully added to queue
    toast.success('Scan added to queue and will process shortly');
    
    return {
      success: true,
      note: 'Scan queued for processing'
    };
  } catch (error) {
    console.error('Error during Lighthouse scan:', error);
    toast.error('Lighthouse scan failed. Please try again later.');
    return { success: false };
  }
}

// BuiltWith scanning functionality to detect CMS and technology stack
export async function scanWithBuiltWith(businessId: string, website: string): Promise<{ success: boolean; cms?: string; isMobileFriendly?: boolean }> {
  try {
    console.log(`Scanning website with BuiltWith: ${website}`);
    
    // Update CMS and mobile-friendly status in the database
    const updateBusinessTech = async (cms: string, isMobileFriendly: boolean) => {
      const { error } = await supabase
        .from('businesses')
        .update({
          cms: cms,
          is_mobile_friendly: isMobileFriendly,
          last_checked: new Date().toISOString()
        })
        .eq('id', businessId);
      
      if (error) {
        console.error('Error updating business tech info:', error);
        throw error;
      }
    };
    
    const { data, error } = await supabase.functions.invoke('builtwith-scan', {
      body: { website, businessId }
    });

    if (error) {
      console.error('BuiltWith invoke error:', error);
      toast.error(`Technology detection failed: ${error.message}`);
      return { success: false };
    }
    
    if (data.error) {
      console.error('BuiltWith scan error:', data.error);
      toast.error(`Technology detection failed: ${data.error}`);
      return { success: false };
    }
    
    // Update the business with the detected CMS and mobile-friendly status
    await updateBusinessTech(data.cms || 'Unknown', data.isMobileFriendly || false);
    
    if (data.cms && data.cms !== 'Unknown') {
      toast.success(`CMS detected: ${data.cms}`);
    } else {
      toast.info('No CMS detected');
    }
    
    if (data.isMobileFriendly) {
      toast.success('Website is mobile-friendly');
    } else {
      toast.warning('Website may not be mobile-friendly');
    }
    
    return { 
      success: true,
      cms: data.cms,
      isMobileFriendly: data.isMobileFriendly
    };
  } catch (error) {
    console.error('Error during BuiltWith scan:', error);
    toast.error('Technology detection failed. Please try again later.');
    return { success: false };
  }
}

// Get GTmetrix usage statistics
export async function getGTmetrixUsage(): Promise<{ used: number; limit: number; resetDate: string }> {
  try {
    // First try to get the GTmetrix usage record
    let { data, error } = await supabase
      .from('gtmetrix_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // If there's no record or an error, create a default one
    if (error || !data || data.length === 0) {
      console.log('No GTmetrix usage records found, creating default');
      
      // Get current month in YYYY-MM format
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Insert a default record
      const { data: newRecord, error: insertError } = await supabase
        .from('gtmetrix_usage')
        .insert({
          month: currentMonth,
          scans_used: 0,
          scans_limit: 3,
          reset_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating GTmetrix usage record:', insertError);
        return { used: 0, limit: 3, resetDate: new Date().toISOString() };
      }
      
      data = [newRecord];
    }
    
    const record = data[0];
    
    return {
      used: record.scans_used || 0,
      limit: record.scans_limit || 3,
      resetDate: record.reset_date || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching GTmetrix usage:', error);
    return { used: 0, limit: 3, resetDate: new Date().toISOString() };
  }
}

// Get businesses that need score updates - for the Scan Manager
export async function getBusinessesNeedingRealScores(): Promise<string[]> {
  try {
    // Get businesses that have no lighthouse score or outdated scores
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .or(`lighthouse_score.is.null,last_lighthouse_scan.lt.${oneWeekAgo.toISOString()}`)
      .order('last_lighthouse_scan', { ascending: true, nullsFirst: true })
      .limit(10);
    
    if (error) {
      console.error('Error fetching businesses needing scores:', error);
      return [];
    }
    
    return data.map(business => business.id);
  } catch (error) {
    console.error('Error in getBusinessesNeedingRealScores:', error);
    return [];
  }
}
