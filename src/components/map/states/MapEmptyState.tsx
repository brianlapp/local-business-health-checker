
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2, MapIcon } from 'lucide-react';

interface MapEmptyStateProps {
  isLoading?: boolean;
  noToken?: boolean;
  mapError?: string | null;
  interactive?: boolean;
}

/**
 * Component to display empty, loading, or error states for the map
 */
const MapEmptyState: React.FC<MapEmptyStateProps> = ({
  isLoading = false,
  noToken = false,
  mapError = null,
  interactive = false
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading map data...</p>
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
  
  if (!interactive) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <MapPin className="h-8 w-8 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground">No businesses to display on map</p>
      </Card>
    );
  }
  
  return null;
};

export default MapEmptyState;
