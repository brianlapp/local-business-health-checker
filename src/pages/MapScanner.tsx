
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { scanBusinessesInArea } from '@/services/apiService';
import { Business } from '@/types/business';
import { toast } from 'sonner';

const MapScanner = () => {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedBusinesses, setScannedBusinesses] = useState<Business[]>([]);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error('Please enter a location to scan');
      return;
    }
    
    setIsScanning(true);
    setProgress(0);
    
    try {
      // Start the progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const businesses = await scanBusinessesInArea(location, radius);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (businesses.length === 0) {
        toast.info('No businesses found in this area');
      } else {
        setScannedBusinesses(businesses);
        toast.success(`Found ${businesses.length} businesses in ${location}`);
      }
    } catch (error) {
      toast.error('Failed to scan area, please try again');
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleViewAll = () => {
    navigate('/');
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Area Scanner</h2>
          <p className="text-muted-foreground">Find businesses in a specific area</p>
        </div>
        <Button variant="outline" onClick={handleViewAll}>
          View All Businesses
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Scan Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, Address or Zip Code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    disabled={isScanning}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="radius">
                  Radius (miles)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                    disabled={isScanning}
                  />
                  <span className="text-sm font-medium w-8 text-center">{radius}</span>
                </div>
              </div>
              
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {scannedBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <p className="mt-2 text-muted-foreground">
                  {isScanning 
                    ? 'Scanning for businesses...' 
                    : 'No businesses scanned yet. Enter a location and start scanning.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Found {scannedBusinesses.length} businesses in {location}
                </div>
                <div className="space-y-2">
                  {scannedBusinesses.map((business) => (
                    <div 
                      key={business.id} 
                      className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <div className="font-medium">{business.name}</div>
                        <div className="text-sm text-muted-foreground">{business.website}</div>
                      </div>
                      <div className={`text-sm font-bold px-2 py-1 rounded ${
                        business.score >= 80 ? 'bg-red-100 text-red-600' : 
                        business.score >= 60 ? 'bg-orange-100 text-orange-600' : 
                        business.score >= 40 ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-green-100 text-green-600'
                      }`}>
                        {business.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapScanner;
