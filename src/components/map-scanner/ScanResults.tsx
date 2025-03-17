
import React from 'react';
import { Business } from '@/types/business';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/map/MapView';
import ScanResultItem from '@/components/business/ScanResultItem';

interface ScanResultsProps {
  businesses: Business[];
  location: string;
  isScanning: boolean;
  scanComplete: boolean;
  scanRadius: number;
  handleViewResults: () => void;
}

const ScanResults: React.FC<ScanResultsProps> = ({
  businesses,
  location,
  isScanning,
  scanComplete,
  scanRadius,
  handleViewResults
}) => {
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');

  if (businesses.length === 0) {
    return (
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Scan Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <p className="mt-2 text-muted-foreground">
              {isScanning 
                ? 'Scanning for Canadian businesses...' 
                : 'No businesses scanned yet. Enter a Canadian location and start scanning.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Scan Results</CardTitle>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as 'list' | 'map')}
            className="w-auto"
          >
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanComplete && businesses.length > 0 && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <Check className="h-4 w-4" />
            <AlertTitle>Scan Complete!</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Found {businesses.length} businesses in {location}.</p>
              <Button 
                variant="outline" 
                className="bg-white dark:bg-gray-800 mt-2"
                onClick={handleViewResults}
              >
                View Results on Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {viewMode === 'map' && (
          <MapView 
            businesses={businesses}
            location={location}
            isLoading={isScanning}
          />
        )}
        
        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <StatusBadge 
                status={isScanning ? 'scanning' : 'success'} 
                text={`${businesses.length} businesses in ${location}`} 
              />
              {scanRadius && (
                <span className="text-xs text-muted-foreground">
                  (within {scanRadius}km radius)
                </span>
              )}
            </div>
            <div className="space-y-2">
              {businesses.map((business) => (
                <ScanResultItem 
                  key={business.id}
                  business={business}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanResults;
