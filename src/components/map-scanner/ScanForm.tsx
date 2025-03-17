
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Loader2, Bug } from 'lucide-react';
import { toast } from 'sonner';

interface ScanFormProps {
  isScanning: boolean;
  location: string;
  setLocation: (value: string) => void;
  scanRadius: number;
  setScanRadius: (value: number) => void;
  source: string;
  setSource: (value: string) => void;
  autoRedirect: boolean;
  setAutoRedirect: (value: boolean) => void;
  debugMode: boolean;
  setDebugMode: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  progress: number;
}

const ScanForm: React.FC<ScanFormProps> = ({
  isScanning,
  location,
  setLocation,
  scanRadius,
  setScanRadius,
  source,
  setSource,
  autoRedirect,
  setAutoRedirect,
  debugMode,
  setDebugMode,
  onSubmit,
  progress
}) => {
  const dataSources = [
    { value: 'google', label: 'Google Maps' },
    { value: 'yellowpages', label: 'Yellow Pages' },
    { value: 'localstack', label: 'LocalStack (Sample Data)' },
  ];

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Scan Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="location">
              Canadian Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="City, Province, Canada"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
                disabled={isScanning}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use format: "City, Province" or "City, Province, Canada"<br />
              Examples: "Toronto, Ontario" or "Vancouver, BC, Canada"
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Scan Radius: {scanRadius} km</label>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[scanRadius]}
              onValueChange={(values) => setScanRadius(values[0])}
              disabled={isScanning}
            />
            <p className="text-xs text-muted-foreground">
              Adjust the search radius (1-20 km)
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="source">
              Data Source
            </label>
            <Select
              value={source}
              onValueChange={setSource}
              disabled={isScanning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose where to scrape Canadian business data from
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="autoRedirect" 
              checked={autoRedirect}
              onCheckedChange={(checked) => setAutoRedirect(checked === true)}
              disabled={isScanning}
            />
            <label 
              htmlFor="autoRedirect" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto-redirect to dashboard after scan
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="debugMode" 
              checked={debugMode}
              onCheckedChange={(checked) => setDebugMode(checked === true)}
              disabled={isScanning}
            />
            <label 
              htmlFor="debugMode" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
            >
              <Bug className="h-4 w-4 mr-1" />
              Enable Debug Mode
            </label>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Provides additional technical details for troubleshooting
          </p>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isScanning || !location}
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan Area
              </>
            )}
          </Button>
          
          {isScanning && (
            <div className="space-y-1">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scanning businesses in {location}...
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ScanForm;
