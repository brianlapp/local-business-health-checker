import React, { useEffect, useRef, useState } from 'react';
import { Business } from '@/types/business';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { MapPin, Loader2, Map as MapIcon, Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';
import { geocodeLocation } from '@/services/map/geocodingService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MapViewProps {
  businesses: Business[];
  location: string;
  isLoading?: boolean;
  onLocationSelect?: (location: string) => void;
  interactive?: boolean;
  radius?: number;
}

const MapView: React.FC<MapViewProps> = ({ 
  businesses, 
  location, 
  isLoading = false,
  onLocationSelect,
  interactive = false,
  radius = 5
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(location);
  
  const cleanupMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };
  
  useEffect(() => {
    if (isLoading || !mapContainerRef.current) return;
    
    if (map.current) return;
    
    async function initializeMap() {
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
        
        const defaultCoordinates = [-79.347, 43.651];
        
        map.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: data.styleUrl || 'mapbox://styles/mapbox/streets-v12',
          center: defaultCoordinates,
          zoom: 10
        });
        
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapInitialized(true);
          
          updateMapWithBusinesses();
        });
        
        if (interactive && map.current) {
          map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            
            new mapboxgl.Popup()
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="text-align: center;">
                  <strong>Selected Location</strong><br>
                  <button 
                    id="use-location-btn"
                    style="
                      background: #3b82f6; 
                      color: white; 
                      border: none; 
                      padding: 4px 8px; 
                      border-radius: 4px;
                      margin-top: 4px;
                      cursor: pointer;
                    "
                  >
                    Search this area
                  </button>
                </div>
              `)
              .addTo(map.current);
              
            setTimeout(() => {
              document.getElementById('use-location-btn')?.addEventListener('click', () => {
                if (onLocationSelect) {
                  const locationStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
                  onLocationSelect(locationStr);
                  toast.info(`Searching area around ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
              });
            }, 100);
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapInitialized(false);
        setMapError(error.message || 'Failed to initialize map');
      }
    }
    
    initializeMap();
    
    return () => {
      cleanupMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoading, interactive, onLocationSelect]);

  useEffect(() => {
    updateMapWithBusinesses();
  }, [businesses, location, mapInitialized, radius]);

  const updateMapWithBusinesses = async () => {
    if (!map.current || !mapInitialized) return;
    
    cleanupMarkers();
    
    try {
      const geocodeResult = await geocodeLocation(location);
      const coordinates = geocodeResult.coordinates;
      
      setMapCenter(coordinates);
      
      map.current.flyTo({
        center: coordinates,
        zoom: 11,
        essential: true,
        duration: 1500
      });
      
      if (radius && radius > 0) {
        const existingSource = map.current.getSource('radius-circle');
        
        if (existingSource) {
          (existingSource as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates
            },
            properties: {
              radius: radius * 1000
            }
          });
        } else {
          map.current.addSource('radius-circle', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates
              },
              properties: {
                radius: radius * 1000
              }
            }
          });
          
          map.current.addLayer({
            id: 'radius-circle-fill',
            type: 'circle',
            source: 'radius-circle',
            paint: {
              'circle-radius': ['get', 'radius'],
              'circle-color': '#3b82f6',
              'circle-opacity': 0.15,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#3b82f6',
              'circle-stroke-opacity': 0.5,
              'circle-radius-units': 'meters'
            }
          });
        }
      }
      
      businesses.forEach((business) => {
        if (mapCenter) {
          addBusinessMarker(business, mapCenter);
        }
      });
    } catch (error) {
      console.error('Error geocoding location for map:', error);
      
      const defaultCoordinates: [number, number] = [-79.347, 43.651];
      businesses.forEach((business) => {
        addBusinessMarker(business, defaultCoordinates);
      });
    }
  };

  const addBusinessMarker = (business: Business, centerCoordinates: [number, number]) => {
    if (!map.current) return;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (radius * 0.8);
    
    const earthRadius = 6371;
    const latDegree = distance / earthRadius * (180 / Math.PI);
    const lngDegree = latDegree / Math.cos(centerCoordinates[1] * Math.PI / 180);
    
    const lng = centerCoordinates[0] + lngDegree * Math.cos(angle);
    const lat = centerCoordinates[1] + latDegree * Math.sin(angle);
    
    const el = document.createElement('div');
    el.className = 'business-marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3b82f6';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 240px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${business.name}</h3>
          ${business.industry ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">Industry: ${business.industry}</p>` : ''}
          ${business.website ? `<a href="https://${business.website}" target="_blank" style="font-size: 14px; color: #3b82f6; text-decoration: none;">${business.website}</a>` : ''}
        </div>
      `);
    
    const marker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map.current);
      
    markersRef.current.push(marker);
  };

  const handleSearch = async () => {
    if (!selectedLocation || !onLocationSelect) return;
    
    onLocationSelect(selectedLocation);
    updateMapWithBusinesses();
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading map data...</p>
      </Card>
    );
  }
  
  if (businesses.length === 0 && !interactive) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <MapPin className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground">No businesses to display on map</p>
      </Card>
    );
  }
  
  if (noToken) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <MapIcon className="h-8 w-8 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Map Configuration Required</h3>
        <p className="text-muted-foreground text-center mb-4">
          {mapError || "There was an issue accessing the map service."}
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Please ensure your Mapbox token is properly configured in Supabase Edge Function Secrets.
        </p>
      </Card>
    );
  }
  
  return (
    <Card className="relative overflow-hidden min-h-[300px] md:min-h-[400px] p-0">
      {!mapInitialized && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Initializing map...</p>
        </div>
      )}
      
      <div className="absolute top-2 left-2 z-10 bg-background/80 rounded p-2">
        {interactive ? (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Enter location..."
                className="px-2 py-1 text-sm rounded border border-gray-300 w-48"
              />
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleSearch}
                className="flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click anywhere on the map to select a location
            </p>
          </div>
        ) : (
          <StatusBadge status="info" text={businesses.length > 0 ? `${businesses.length} businesses in ${location}` : location} />
        )}
      </div>
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[300px] md:min-h-[400px]"
      />
    </Card>
  );
};

export default MapView;
