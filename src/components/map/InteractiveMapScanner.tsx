
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MapView } from '@/components/map';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Scan, MapPin } from 'lucide-react';
import { Business } from '@/types/business';

interface InteractiveMapScannerProps {
  onScan: (location: string, radius: number) => Promise<void>;
  businesses: Business[];
  isScanning: boolean;
}

const InteractiveMapScanner: React.FC<InteractiveMapScannerProps> = ({
  onScan,
  businesses,
  isScanning
}) => {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5);
  
  const handleLocationSelect = (newLocation: string) => {
    setLocation(newLocation);
  };
  
  const handleScan = async () => {
    if (!location) {
      toast.error('Please enter a location to scan');
      return;
    }
    
    await onScan(location, radius);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map-Based Discovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Input
                placeholder="Enter location (e.g. Toronto, Ontario)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleScan} 
              disabled={!location || isScanning}
              className="w-full flex items-center gap-2"
            >
              {isScanning ? 'Scanning...' : 'Scan Area'}
              {isScanning ? <Scan className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Scan Radius: {radius} km</span>
            </div>
            <Slider
              value={[radius]}
              min={1}
              max={25}
              step={1}
              onValueChange={(values) => setRadius(values[0])}
            />
            <p className="text-xs text-muted-foreground">
              Adjust the radius to control the scan area size (1-25 km)
            </p>
          </div>
        </div>
        
        <div className="h-[400px] mt-4">
          <MapView 
            businesses={businesses}
            location={location || 'Toronto, Ontario, Canada'}
            interactive={true}
            onLocationSelect={handleLocationSelect}
            radius={radius}
          />
          <p className="text-xs text-muted-foreground mt-2">
            You can click on the map to set a location, or type an address above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMapScanner;
