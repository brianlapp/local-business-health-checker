
import React, { useEffect, useRef, useState } from 'react';
import { Business } from '@/types/business';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { MapPin, Loader2 } from 'lucide-react';

interface MapViewProps {
  businesses: Business[];
  location: string;
  isLoading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ businesses, location, isLoading = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // For now, we'll create a simulated map view
  // In a future implementation, this would use an actual map library like Mapbox or Google Maps
  
  useEffect(() => {
    // Simulate map loading
    if (businesses.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setIsMapReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [businesses, isLoading]);
  
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
  
  return (
    <Card className="relative overflow-hidden min-h-[300px] md:min-h-[400px]">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 bg-secondary/20"
      >
        {!isMapReady ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Initializing map...</p>
          </div>
        ) : (
          <div className="p-4 h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center mb-4">
              <StatusBadge status="info" text={`Map view: ${location}`} />
            </div>
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Map view simulation</p>
              <p className="font-medium">{businesses.length} businesses in {location}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 max-w-xl mx-auto">
              {businesses.slice(0, 6).map((business) => (
                <div 
                  key={business.id} 
                  className="bg-background border rounded-md p-2 text-xs"
                >
                  <div className="font-medium truncate">{business.name}</div>
                  <div className="text-muted-foreground truncate">{business.website}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              In a real implementation, this would display an interactive map with business markers.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MapView;
