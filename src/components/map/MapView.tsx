
import React, { useEffect, useRef, useState } from 'react';
import { Business } from '@/types/business';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
// Note: mapbox-gl CSS is imported in the main CSS file
import { geocodeLocation } from '@/services/map/geocodingService';

// Import refactored components
import MapEmptyState from './states/MapEmptyState';
import MapControls from './controls/MapControls';
import BusinessMarker from './markers/BusinessMarker';
import { useMapInitialization } from './hooks/useMapInitialization';
import { renderRadiusCircle, createLocationSelectionPopup, getBusinessMarkerCoordinates } from './utils/mapHelpers';

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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(location);
  
  // Handle map click events
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!interactive || !onLocationSelect) return;
    createLocationSelectionPopup(map.current!, e.lngLat, (location) => {
      onLocationSelect(location);
      toast.info(`Searching area around ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`);
    });
  };
  
  // Initialize map
  const { map, mapInitialized, noToken, mapError } = useMapInitialization(
    mapContainerRef, 
    isLoading, 
    interactive,
    handleMapClick
  );
  
  // Remove all markers from the map
  const cleanupMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };
  
  // Update map with businesses and location
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
      
      // Render the radius circle if radius is provided
      if (radius && radius > 0) {
        renderRadiusCircle(map.current, coordinates, radius);
      }
      
      // Add business markers
      if (mapCenter) {
        businesses.forEach((business) => {
          const markerCoordinates = getBusinessMarkerCoordinates(business, coordinates, radius);
          const marker = BusinessMarker({ 
            business, 
            map: map.current!, 
            coordinates: markerCoordinates 
          });
          markersRef.current.push(marker);
        });
      }
    } catch (error) {
      console.error('Error geocoding location for map:', error);
      
      // Fallback to default coordinates
      const defaultCoordinates: [number, number] = [-79.347, 43.651];
      businesses.forEach((business) => {
        const markerCoordinates = getBusinessMarkerCoordinates(business, defaultCoordinates, radius);
        const marker = BusinessMarker({ 
          business, 
          map: map.current!, 
          coordinates: markerCoordinates 
        });
        markersRef.current.push(marker);
      });
    }
  };

  // Update map when businesses, location, or other props change
  useEffect(() => {
    updateMapWithBusinesses();
  }, [businesses, location, mapInitialized, radius]);

  // Handle search button click
  const handleSearch = async () => {
    if (!selectedLocation || !onLocationSelect) return;
    
    onLocationSelect(selectedLocation);
    updateMapWithBusinesses();
  };

  // Show empty states when needed
  if (isLoading || noToken || (businesses.length === 0 && !interactive)) {
    return (
      <MapEmptyState
        isLoading={isLoading}
        noToken={noToken}
        mapError={mapError}
        interactive={interactive}
      />
    );
  }
  
  return (
    <Card className="relative overflow-hidden min-h-[300px] md:min-h-[400px] p-0">
      {!mapInitialized && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/80">
          <MapEmptyState isLoading={true} />
        </div>
      )}
      
      <div className="absolute top-2 left-2 z-10 bg-background/80 rounded p-2">
        <MapControls
          interactive={interactive}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          handleSearch={handleSearch}
          businessCount={businesses.length}
          location={location}
        />
      </div>
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[300px] md:min-h-[400px]"
      />
    </Card>
  );
};

export default MapView;
