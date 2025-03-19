
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/lib/supabase';

/**
 * Hook to handle map initialization and token fetching
 */
export const useMapInitialization = (
  mapContainerRef: React.RefObject<HTMLDivElement>,
  isLoading: boolean,
  interactive: boolean,
  onMapClick?: (e: mapboxgl.MapMouseEvent) => void
) => {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (isLoading || !mapContainerRef.current) return;
    
    if (map.current) return;
    
    const initializeMap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-proxy', {
          body: { style: 'streets-v12' }
        });
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setNoToken(true);
          setMapError('Failed to fetch Mapbox configuration');
          return;
        }
        
        if (!data || !data.token) {
          console.error('No token received from Edge Function');
          setNoToken(true);
          setMapError('Authentication error with map service');
          return;
        }
        
        mapboxgl.accessToken = data.token;
        
        // Ensure coordinates are properly typed as [number, number]
        const defaultCoordinates: [number, number] = [-79.347, 43.651];
        
        map.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: data.styleUrl || 'mapbox://styles/mapbox/streets-v12',
          center: defaultCoordinates,
          zoom: 10
        });
        
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapInitialized(true);
        });
        
        if (interactive && map.current && onMapClick) {
          map.current.on('click', onMapClick);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapInitialized(false);
        setMapError(error.message || 'Failed to initialize map');
      }
    };
    
    initializeMap();
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoading, interactive, mapContainerRef, onMapClick]);

  return { map, mapInitialized, noToken, mapError };
};
