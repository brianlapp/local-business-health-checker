
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';
import { ensureBusinessStatus, ensureBusinessesStatus } from '../../businessUtilsService';

/**
 * Filter businesses that might be agencies based on name
 */
export function filterPotentialAgencies(businesses: Business[]): Business[] {
  const agencyKeywords = [
    'agency', 'digital', 'marketing', 'web', 'design', 'media', 
    'creative', 'studios', 'consulting', 'solutions', 'development',
    'tech', 'software', 'systems', 'IT', 'technology', 'interactive',
    'studio', 'partners', 'group', 'collective', 'innovation'
  ];
  
  return businesses.filter(business => {
    if (!business.name) return false;
    
    const lowerName = business.name.toLowerCase();
    return agencyKeywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
  });
}

/**
 * Add an agency to the database
 */
export async function addAgencyToDatabase(agency: Business): Promise<boolean> {
  try {
    console.log('Adding agency to database:', agency.name);
    
    // Add the agency to both businesses and agencies tables
    const { error: businessError } = await supabase
      .from('businesses')
      .upsert({
        name: agency.name,
        website: agency.website,
        status: agency.status || 'discovered',
        industry: agency.industry || 'Digital Agency',
        score: agency.score || 50,
        last_checked: new Date().toISOString(),
        is_agency: true
      }, {
        onConflict: 'website',
        ignoreDuplicates: false
      });
    
    if (businessError) {
      throw businessError;
    }
    
    // Also add to recruitment_agencies table for specialized tracking
    const { error: agencyError } = await supabase
      .from('recruitment_agencies')
      .upsert({
        name: agency.name,
        website: agency.website,
        contact_email: agency.contact_info?.email || null,
        contact_phone: agency.contact_info?.phone || null,
        status: 'new',
        notes: `Auto-discovered agency in ${agency.location || 'unknown location'}`
      }, {
        onConflict: 'website',
        ignoreDuplicates: true
      });
    
    if (agencyError) {
      console.warn('Error adding to recruitment_agencies:', agencyError);
      // Continue anyway since we've added to businesses table
    }
    
    toast.success(`Added agency: ${agency.name}`);
    return true;
  } catch (error) {
    console.error('Error adding agency:', error);
    toast.error(`Failed to add agency: ${agency.name}`);
    return false;
  }
}

/**
 * Get all agencies from the database
 */
export async function getAgenciesFromDatabase(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_agency', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Use our utility function to ensure all agencies have the required fields
    return ensureBusinessesStatus(data);
  } catch (error) {
    console.error('Error getting agencies:', error);
    toast.error('Failed to load agencies');
    return [];
  }
}
