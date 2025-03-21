import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';
import { generateIssues, ensureBusinessStatus, ensureBusinessesStatus } from './businessUtilsService';

export async function getBusinesses(): Promise<Business[]> {
  try {
    console.log('Fetching businesses from database');
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} businesses`);
    
    // Use our utility function to ensure all businesses have the correct shape
    return ensureBusinessesStatus(data);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    toast.error('Failed to load businesses');
    return [];
  }
}

export async function clearAllBusinesses(): Promise<boolean> {
  try {
    console.log('Starting clearAllBusinesses function');
    
    // First, get count of businesses to be deleted
    const { count: businessCount } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Found ${businessCount} businesses to delete`);
    
    if (businessCount === 0) {
      console.log('No businesses to delete');
      return true;
    }
    
    // Call the database function to delete all businesses
    const { error: deleteError } = await supabase.rpc('delete_all_businesses');
    
    if (deleteError) {
      console.error('Delete all businesses error:', deleteError);
      throw deleteError;
    }
    
    console.log('Successfully deleted all business records');
    
    // Reset GTmetrix usage counters
    const { error: resetError } = await supabase
      .from('gtmetrix_usage')
      .update({ scans_used: 0 });
    
    if (resetError) {
      console.warn('Warning: Could not reset GTmetrix usage counters:', resetError);
      // Continue anyway as this is not critical
    } else {
      console.log('Successfully reset GTmetrix usage counters');
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing business data:', error);
    throw error;
  }
}

export async function clearSelectedBusinesses(businessIds: string[]): Promise<boolean> {
  try {
    if (!businessIds.length) return false;
    
    console.log('Deleting selected businesses:', businessIds);
    
    // Delete selected businesses with explicit IDs
    const { error } = await supabase
      .from('businesses')
      .delete()
      .in('id', businessIds);
    
    if (error) {
      console.error('Supabase delete selected error:', error);
      throw error;
    }
    
    console.log('Selected businesses deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting selected businesses:', error);
    throw error;
  }
}

export async function addBusiness(business: Omit<Business, 'id' | 'issues'>): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: business.name,
        website: business.website,
        score: business.score,
        cms: business.cms,
        lighthouse_score: business.lighthouseScore,
        last_checked: business.last_checked || business.lastChecked,
        status: business.status || 'discovered', // Ensure status is set
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Business added successfully');
    
    // Use our utility function to ensure the business has the correct shape
    return ensureBusinessStatus(data);
  } catch (error) {
    console.error('Error adding business:', error);
    toast.error('Failed to add business');
    return null;
  }
}

export async function updateBusiness(id: string, updates: Partial<Omit<Business, 'id' | 'issues'>>): Promise<boolean> {
  try {
    const updateData: any = {
      name: updates.name,
      website: updates.website,
      score: updates.score,
      cms: updates.cms,
      last_checked: updates.last_checked || updates.lastChecked,
      is_mobile_friendly: updates.is_mobile_friendly,
      status: updates.status || 'discovered', // Ensure status is set
    };
    
    // Map the new properties to the database column names
    if (updates.lighthouseScore !== undefined) {
      updateData.lighthouse_score = updates.lighthouseScore;
    }
    
    if (updates.gtmetrixScore !== undefined) {
      updateData.gtmetrix_score = updates.gtmetrixScore;
    }
    
    if (updates.lighthouseReportUrl !== undefined) {
      updateData.lighthouse_report_url = updates.lighthouseReportUrl;
    }
    
    if (updates.gtmetrixReportUrl !== undefined) {
      updateData.gtmetrix_report_url = updates.gtmetrixReportUrl;
    }
    
    if (updates.lastLighthouseScan !== undefined) {
      updateData.last_lighthouse_scan = updates.lastLighthouseScan;
    }
    
    if (updates.lastGtmetrixScan !== undefined) {
      updateData.last_gtmetrix_scan = updates.lastGtmetrixScan;
    }
    
    const { error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Business updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating business:', error);
    toast.error('Failed to update business');
    return false;
  }
}
