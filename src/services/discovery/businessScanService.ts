
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Business, BusinessScanResponse } from '@/types/business';
import { ensureBusinessStatus } from '../businessUtilsService';

/**
 * Search for local businesses in a specific location
 */
export async function searchLocalBusinesses(
  location: string,
  industry?: string
): Promise<BusinessScanResponse> {
  try {
    console.log(`Searching for businesses in ${location}, industry: ${industry || 'any'}`);
    
    // Call the business search API
    const response = await fetch(`/api/local-businesses-search?location=${encodeURIComponent(location)}&industry=${encodeURIComponent(industry || '')}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure all businesses have the required status field
    const businesses = data.businesses.map((business: any) => ({
      ...business,
      status: business.status || 'discovered'
    }));
    
    return {
      businesses,
      count: businesses.length,
      location,
      industry
    };
  } catch (error) {
    console.error('Error searching businesses:', error);
    toast.error('Failed to search for businesses');
    return {
      businesses: [],
      count: 0,
      location,
      industry,
      error: 'Failed to search for businesses'
    };
  }
}

/**
 * Add a local business to your database
 */
export async function addLocalBusiness(businessData: Partial<Business>): Promise<Business | null> {
  try {
    // Make sure name and status are included in the data
    if (!businessData.name) {
      throw new Error('Business name is required');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: businessData.name,
        website: businessData.website,
        industry: businessData.industry,
        location: businessData.location,
        status: businessData.status || 'discovered',
        score: businessData.score || 50
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

/**
 * Get all local businesses from your database
 */
export async function getLocalBusinesses(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Use our utility function to ensure all businesses have the required fields
    return data.map(business => ensureBusinessStatus(business));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    toast.error('Failed to load businesses');
    return [];
  }
}
