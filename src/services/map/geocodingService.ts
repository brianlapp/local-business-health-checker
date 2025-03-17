
import { supabase } from '@/lib/supabase';

/**
 * Interface for geocoding response
 */
export interface GeocodingResponse {
  coordinates: [number, number];
  source: 'mapbox' | 'local-database' | 'default';
  formatted_location: string;
  error?: string;
}

/**
 * Geocode a location string to coordinates
 */
export async function geocodeLocation(location: string): Promise<GeocodingResponse> {
  try {
    console.log(`Geocoding location: ${location}`);
    
    // Call the geocode-location edge function
    const { data, error } = await supabase.functions.invoke('geocode-location', {
      body: { location }
    });
    
    if (error) {
      console.error('Error calling geocode function:', error);
      throw new Error(error.message || 'Failed to geocode location');
    }
    
    console.log('Geocoding response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data as GeocodingResponse;
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Fallback to Toronto
    return {
      coordinates: [-79.347, 43.651],
      source: 'default',
      formatted_location: 'Toronto, Canada',
      error: error.message
    };
  }
}

/**
 * Calculate the bounding box for a given center point and radius in km
 */
export function calculateBoundingBox(
  center: [number, number], 
  radiusKm: number
): { north: number; south: number; east: number; west: number } {
  // Earth's radius in km
  const EARTH_RADIUS = 6371;
  
  const [lng, lat] = center;
  
  // Convert radius from km to radians
  const radiusRadians = radiusKm / EARTH_RADIUS;
  
  // Calculate lat/lng bounds
  const latChange = radiusRadians * (180 / Math.PI);
  const lngChange = radiusRadians * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
  
  return {
    north: lat + latChange,
    south: lat - latChange,
    east: lng + lngChange,
    west: lng - lngChange
  };
}

/**
 * Generate a random point within a radius of a center point
 */
export function generateRandomPointInRadius(
  center: [number, number], 
  radiusKm: number
): [number, number] {
  // Earth's radius in km
  const EARTH_RADIUS = 6371;
  
  // Convert radius from km to radians
  const radiusRadians = radiusKm / EARTH_RADIUS;
  
  // Generate a random point in a circle
  const randomRadius = Math.sqrt(Math.random()) * radiusRadians;
  const randomAngle = Math.random() * Math.PI * 2;
  
  const [lng, lat] = center;
  
  // Calculate offset
  const latOffset = randomRadius * Math.cos(randomAngle);
  const lngOffset = randomRadius * Math.sin(randomAngle) / Math.cos(lat * Math.PI / 180);
  
  // Convert back to degrees
  const newLat = lat + latOffset * (180 / Math.PI);
  const newLng = lng + lngOffset * (180 / Math.PI);
  
  return [newLng, newLat];
}
