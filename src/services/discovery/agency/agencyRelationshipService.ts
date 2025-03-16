
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';

export interface AgencyClientRelationship {
  id?: string;
  agency_id: string;
  client_id: string;
  relationship_type?: string;
  source?: string;
  discovered_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RelationshipMapData {
  agencies: Business[];
  clients: Business[];
  relationships: AgencyClientRelationship[];
}

/**
 * Add a client to an agency's portfolio
 */
export async function addClientToAgencyPortfolio(
  agencyId: string,
  clientId: string,
  relationshipType: string = 'portfolio',
  source: string = 'manual'
): Promise<boolean> {
  try {
    // First check if this relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('agency_client_relationships')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('client_id', clientId)
      .single();

    if (checkError && !checkError.message.includes('No rows found')) {
      console.error('Error checking for existing relationship:', checkError);
      return false;
    }

    if (existingRelationship) {
      console.log('Relationship already exists');
      return true; // Already exists, no need to add
    }

    // Add the new relationship
    const { error } = await supabase
      .from('agency_client_relationships')
      .insert({
        agency_id: agencyId,
        client_id: clientId,
        relationship_type: relationshipType,
        source: source,
        discovered_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error adding client to agency portfolio:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addClientToAgencyPortfolio:', error);
    return false;
  }
}

/**
 * Add multiple clients to an agency's portfolio
 */
export async function addBulkClientsToAgencyPortfolio(
  agencyId: string,
  clientIds: string[],
  relationshipType: string = 'portfolio',
  source: string = 'portfolio-analysis'
): Promise<{ success: number; failed: number }> {
  if (!clientIds.length) {
    return { success: 0, failed: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  try {
    // Create an array of relationship objects
    const relationships = clientIds.map(clientId => ({
      agency_id: agencyId,
      client_id: clientId,
      relationship_type: relationshipType,
      source: source,
      discovered_at: new Date().toISOString()
    }));

    // Insert all relationships in one operation
    const { data, error } = await supabase
      .from('agency_client_relationships')
      .upsert(relationships, { 
        onConflict: 'agency_id,client_id',
        ignoreDuplicates: true 
      });

    if (error) {
      console.error('Error adding bulk clients to agency portfolio:', error);
      failedCount = clientIds.length;
    } else {
      // Count successful inserts (this might not be accurate if some were ignored)
      successCount = clientIds.length;
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error in addBulkClientsToAgencyPortfolio:', error);
    return { success: successCount, failed: clientIds.length - successCount };
  }
}

/**
 * Get all relationships for the relationship map
 */
export async function getRelationshipMapData(): Promise<RelationshipMapData> {
  try {
    // Get all agencies
    const { data: agenciesData, error: agencyError } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_agency', true);

    if (agencyError) {
      console.error('Error fetching agencies:', agencyError);
      throw agencyError;
    }

    // Transform agency data to include required fields
    const agencies = agenciesData.map(agency => ({
      ...agency,
      status: agency.status || 'discovered'
    })) as Business[];

    // Get all relationships
    const { data: relationships, error: relationshipError } = await supabase
      .from('agency_client_relationships')
      .select('*');

    if (relationshipError) {
      console.error('Error fetching relationships:', relationshipError);
      throw relationshipError;
    }

    // Get all client IDs from relationships
    const clientIds = [...new Set(relationships.map(rel => rel.client_id))];

    // Fetch all clients in one query
    const { data: clientsData, error: clientError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', clientIds);

    if (clientError) {
      console.error('Error fetching clients:', clientError);
      throw clientError;
    }

    // Transform client data to include required fields
    const clients = clientsData.map(client => ({
      ...client,
      status: client.status || 'discovered'
    })) as Business[];

    return {
      agencies,
      clients,
      relationships: relationships || []
    };
  } catch (error) {
    console.error('Error getting relationship map data:', error);
    toast.error('Failed to load relationship data');
    return { agencies: [], clients: [], relationships: [] };
  }
}

/**
 * Get all clients for a specific agency
 */
export async function getAgencyClients(agencyId: string): Promise<Business[]> {
  try {
    // Get all relationships for this agency
    const { data: relationships, error: relationshipError } = await supabase
      .from('agency_client_relationships')
      .select('client_id')
      .eq('agency_id', agencyId);

    if (relationshipError) {
      console.error('Error fetching relationships:', relationshipError);
      throw relationshipError;
    }

    if (!relationships.length) {
      return [];
    }

    // Get all client IDs from relationships
    const clientIds = relationships.map(rel => rel.client_id);

    // Fetch all clients in one query
    const { data: clientsData, error: clientError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', clientIds);

    if (clientError) {
      console.error('Error fetching clients:', clientError);
      throw clientError;
    }

    // Transform client data to include required fields
    return clientsData.map(client => ({
      ...client,
      status: client.status || 'discovered'
    })) as Business[];
  } catch (error) {
    console.error('Error getting agency clients:', error);
    toast.error('Failed to load agency clients');
    return [];
  }
}

/**
 * Find all agencies that share clients with the given agency
 */
export async function findCompetitorAgencies(agencyId: string): Promise<Business[]> {
  try {
    // Get clients of this agency
    const agency1Clients = await getAgencyClients(agencyId);
    
    if (!agency1Clients.length) {
      return [];
    }

    const clientIds = agency1Clients.map(client => client.id);

    // Find relationships where these clients are linked to other agencies
    const { data: competitorRelationships, error: relError } = await supabase
      .from('agency_client_relationships')
      .select('agency_id')
      .in('client_id', clientIds)
      .neq('agency_id', agencyId);

    if (relError) {
      console.error('Error finding competitor relationships:', relError);
      throw relError;
    }

    if (!competitorRelationships.length) {
      return [];
    }

    // Get unique competitor agency IDs
    const competitorIds = [...new Set(competitorRelationships.map(rel => rel.agency_id))];

    // Fetch competitor agency details
    const { data: competitorsData, error: compError } = await supabase
      .from('businesses')
      .select('*')
      .in('id', competitorIds);

    if (compError) {
      console.error('Error fetching competitor details:', compError);
      throw compError;
    }

    // Transform competitor data to include required fields
    return competitorsData.map(competitor => ({
      ...competitor,
      status: competitor.status || 'discovered'
    })) as Business[];
  } catch (error) {
    console.error('Error finding competitor agencies:', error);
    toast.error('Failed to find competitor agencies');
    return [];
  }
}
