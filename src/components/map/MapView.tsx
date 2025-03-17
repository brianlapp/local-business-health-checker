
import React, { useEffect, useRef, useState } from 'react';
import { Business } from '@/types/business';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { MapPin, Loader2, Map as MapIcon } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { env } from '@/lib/env';

// Use token from environment
const MAPBOX_TOKEN = env.mapbox.token;

interface MapViewProps {
  businesses: Business[];
  location: string;
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ businesses, location, isLoading = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [noToken, setNoToken] = useState(false);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (isLoading || businesses.length === 0 || !mapContainerRef.current) return;
    
    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is missing. Please add your token to environment variables as VITE_MAPBOX_TOKEN');
      setNoToken(true);
      return;
    }

    // Initialize map only once
    if (map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Try to geocode the location to get coordinates
    const defaultCoordinates = [-79.347, 43.651]; // Default to Toronto, Canada
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: env.mapbox.styles.street,
        center: defaultCoordinates,
        zoom: 10
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add a loading handler
      map.current.on('load', () => {
        setMapInitialized(true);
        
        // After map is loaded, try to geocode the location and add markers
        geocodeLocation(location).then(coordinates => {
          if (map.current && coordinates) {
            map.current.flyTo({
              center: coordinates,
              zoom: 10,
              essential: true
            });
            
            // Add markers for each business
            addBusinessMarkers(businesses);
          }
        }).catch(err => {
          console.error('Error geocoding location:', err);
          // Still add markers using default coordinates
          addBusinessMarkers(businesses);
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapInitialized(false);
    }
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [businesses, location, isLoading]);

  // Helper function to geocode a location string to coordinates
  const geocodeLocation = async (locationStr: string): Promise<[number, number] | null> => {
    // For now, use a simple mapping of Canadian cities to coordinates
    // In a production app, you would use the Mapbox Geocoding API
    const canadianCities: Record<string, [number, number]> = {
      'toronto': [-79.347, 43.651],
      'vancouver': [-123.116, 49.283],
      'montreal': [-73.568, 45.501],
      'ottawa': [-75.695, 45.424],
      'calgary': [-114.066, 51.049],
      'edmonton': [-113.491, 53.546],
      'quebec': [-71.208, 46.813],
      'winnipeg': [-97.138, 49.895],
      'hamilton': [-79.866, 43.256],
      'victoria': [-123.370, 48.428],
    };
    
    // Try to match the location to a known city
    const cityMatch = Object.keys(canadianCities).find(city => 
      locationStr.toLowerCase().includes(city.toLowerCase())
    );
    
    if (cityMatch) {
      return canadianCities[cityMatch];
    }
    
    // If no match, return Toronto as default
    return [-79.347, 43.651];
  };
  
  // Helper function to add markers for businesses
  const addBusinessMarkers = (businesses: Business[]) => {
    if (!map.current || !mapInitialized) return;
    
    businesses.forEach((business, index) => {
      // Create a spread of businesses around the center
      // Since we don't have actual coordinates for each business,
      // we'll create a "fake" distribution around the center point
      const angle = (index / businesses.length) * Math.PI * 2;
      const radius = 0.01 + (Math.random() * 0.02); // 1-3km approx
      
      const center = map.current!.getCenter();
      const lng = center.lng + Math.cos(angle) * radius;
      const lat = center.lat + Math.sin(angle) * radius;
      
      // Create an HTML element for the marker
      const el = document.createElement('div');
      el.className = 'business-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      // Add a popup with business info
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 240px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">${business.name}</h3>
            ${business.industry ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">Industry: ${business.industry}</p>` : ''}
            ${business.website ? `<a href="https://${business.website}" target="_blank" style="font-size: 14px; color: #3b82f6; text-decoration: none;">${business.website}</a>` : ''}
          </div>
        `);
      
      // Add the marker to the map
      new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };
  
  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading map data...</p>
      </Card>
    );
  }
  
  if (businesses.length === 0) {
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
        <h3 className="text-lg font-medium mb-2">Mapbox Token Required</h3>
        <p className="text-muted-foreground text-center mb-4">
          To display the interactive map, you need to provide a Mapbox access token.
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          1. Create a free account at <a href="https://mapbox.com" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">mapbox.com</a><br/>
          2. Get your public token from the Mapbox dashboard<br/>
          3. Add it to your .env file as VITE_MAPBOX_TOKEN
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
        <StatusBadge status="info" text={`${businesses.length} businesses in ${location}`} />
      </div>
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[300px] md:min-h-[400px]"
      />
    </Card>
  );
};

export default MapView;
