
import React from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search } from 'lucide-react';

interface MapControlsProps {
  interactive?: boolean;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  handleSearch: () => void;
  businessCount?: number;
  location?: string;
}

/**
 * Controls overlay for the map component
 */
const MapControls: React.FC<MapControlsProps> = ({
  interactive = false,
  selectedLocation,
  setSelectedLocation,
  handleSearch,
  businessCount,
  location
}) => {
  if (interactive) {
    return (
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
    );
  }
  
  return (
    <StatusBadge 
      status="info" 
      text={businessCount && businessCount > 0 ? `${businessCount} businesses in ${location}` : location || ''} 
    />
  );
};

export default MapControls;
