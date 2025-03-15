
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Business } from '@/types/business';

interface AgencyClientRelationship {
  id?: string;
  agency_id: string;
  client_id: string;
  relationship_type?: string;
  source?: string;
}

/**
 * Store a relationship between an agency and a client
 */
export async function addAgencyClientRelationship(
  agencyId: string, 
  clientId: string,
  relationshipType: string = 'portfolio',
  source: string = 'portfolio-analysis'
): Promise<boolean> {
  try {
    console.log(`Adding relationship: Agency ${agencyId} -> Client ${clientId}`);
    
    const { data, error } = await supabase
      .from('agency_client_relationships')
      .upsert({
        agency_id: agencyId,
        client_id: clientId,
        relationship_type: relationshipType,
        source: source
      }, {
        onConflict: 'agency_id,client_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Error adding agency-client relationship:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addAgencyClientRelationship:', error);
    return false;
  }
}

/**
 * Get all clients for a specific agency
 */
export async function getAgencyClients(agencyId: string): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_agency_clients', { agency_id: agencyId });
    
    if (error) {
      console.error('Error getting agency clients:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAgencyClients:', error);
    return [];
  }
}

/**
 * Get all agencies for a specific client
 */
export async function getClientAgencies(clientId: string): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_client_agencies', { client_id: clientId });
    
    if (error) {
      console.error('Error getting client agencies:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getClientAgencies:', error);
    return [];
  }
}

/**
 * Gets agencies that share clients (competitors)
 */
export async function getCompetitorAgencies(agencyId: string): Promise<{
  agency: Business;
  sharedClients: number;
}[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_competitor_agencies', { agency_id: agencyId });
    
    if (error) {
      console.error('Error getting competitor agencies:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCompetitorAgencies:', error);
    return [];
  }
}

/**
 * Add multiple client relationships to an agency
 */
export async function addAgencyClientsRelationships(
  agencyId: string,
  clientIds: string[],
  relationshipType: string = 'portfolio',
  source: string = 'portfolio-analysis'
): Promise<{success: number, failed: number}> {
  let success = 0;
  let failed = 0;
  
  for (const clientId of clientIds) {
    const result = await addAgencyClientRelationship(
      agencyId, 
      clientId, 
      relationshipType, 
      source
    );
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  
  return { success, failed };
}

/**
 * Get all agency-client relationships
 */
export async function getAllRelationships(): Promise<{
  agencies: Business[];
  clients: Business[];
  relationships: AgencyClientRelationship[];
}> {
  try {
    // Get all relationships
    const { data: relationshipsData, error: relationshipsError } = await supabase
      .from('agency_client_relationships')
      .select('*');
    
    if (relationshipsError) {
      console.error('Error getting relationships:', relationshipsError);
      return { agencies: [], clients: [], relationships: [] };
    }
    
    // Get all agencies
    const { data: agenciesData, error: agenciesError } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_agency', true);
    
    if (agenciesError) {
      console.error('Error getting agencies:', agenciesError);
      return { agencies: [], clients: [], relationships: relationshipsData || [] };
    }
    
    // Get all businesses that are clients (have relationships)
    const clientIds = [...new Set(relationshipsData?.map(r => r.client_id) || [])];
    
    if (clientIds.length === 0) {
      return { 
        agencies: agenciesData || [], 
        clients: [], 
        relationships: relationshipsData || [] 
      };
    }
    
    const { data: clientsData, error: clientsError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', clientIds);
    
    if (clientsError) {
      console.error('Error getting clients:', clientsError);
      return { 
        agencies: agenciesData || [], 
        clients: [], 
        relationships: relationshipsData || [] 
      };
    }
    
    return {
      agencies: agenciesData || [],
      clients: clientsData || [],
      relationships: relationshipsData || []
    };
  } catch (error) {
    console.error('Error in getAllRelationships:', error);
    return { agencies: [], clients: [], relationships: [] };
  }
}
