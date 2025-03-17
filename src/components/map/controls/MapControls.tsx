
import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Search, Loader2, MapPin } from 'lucide-react';

interface MapControlsProps {
  interactive?: boolean;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  handleSearch: () => void;
  businessCount?: number;
  location?: string;
  isLoading?: boolean;
}

/**
 * Controls overlay for the map component
 * Provides search functionality for interactive mode or status display for static mode
 */
const MapControls: React.FC<MapControlsProps> = ({
  interactive = false,
  selectedLocation,
  setSelectedLocation,
  handleSearch,
  businessCount,
  location,
  isLoading = false
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (interactive) {
    return (
      <div className="flex flex-col gap-2 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-border">
        <div className="flex gap-2">
          <Input
            type="text"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter location..."
            className="w-full md:w-48"
            disabled={isLoading}
          />
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleSearch}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 inline mr-1" />
          Click anywhere on the map to select a location
        </p>
      </div>
    );
  }
  
  return (
    <StatusBadge 
      status={businessCount && businessCount > 0 ? "success" : "info"} 
      text={businessCount && businessCount > 0 
        ? `${businessCount} businesses in ${location}`
        : location || 'No location selected'
      } 
    />
  );
};

export default MapControls;
