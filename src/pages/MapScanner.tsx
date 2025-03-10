
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { scanBusinessesInArea } from '@/services/apiService';
import { Business } from '@/types/business';
import { toast } from 'sonner';

const MapScanner = () => {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(5);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedBusinesses, setScannedBusinesses] = useState<Business[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiTip, setApiTip] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error('Please enter a location to scan');
      return;
    }
    
    setIsScanning(true);
    setProgress(0);
    setScannedBusinesses([]);
    setError(null);
    setApiTip(null);
    setErrorDetails(null);
    
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
      
      toast.info(`Scanning for businesses in ${location}...`);
      const businesses = await scanBusinessesInArea(location, radius);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (businesses.length === 0) {
        setError(`No businesses found in ${location}. Try a different location or increase the radius.`);
        toast.info('No businesses found in this area. Try a different search.');
        setApiTip('Try using a more specific location or a different area. Make sure to include the city and country.');
      } else {
        setScannedBusinesses(businesses);
        toast.success(`Found ${businesses.length} businesses in ${location}`);
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setProgress(100);
      
      // Check for Google Maps API authorization errors
      if (error.message && (
          error.message.includes('API key') || 
          error.message.includes('authorization') || 
          error.message.includes('REQUEST_DENIED') ||
          error.message.includes('OVER_QUERY_LIMIT') ||
          error.message.includes('not authorized')
      )) {
        setError('Google Maps API Authorization Error');
        setApiTip('There might be an issue with the Google Maps API key. This could be related to billing problems on your Google Cloud account.');
        setErrorDetails('If you recently changed your payment method, it may take some time for the changes to propagate through Google\'s systems. Please check your Google Cloud Console billing section.');
        toast.error('Google Maps API authorization error');
      } else if (error.message && error.message.includes('Edge Function')) {
        setError('Edge Function Error');
        setApiTip('There was an issue with the edge function. This is likely a temporary issue. Please try again or check if your Supabase instance is running correctly.');
        toast.error('Edge function error, please try again');
      } else {
        setError(error.message || 'Failed to scan area, please try again');
        toast.error('Failed to scan area: ' + (error.message || 'Unknown error'));
      }
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
                  Radius (kilometres)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                    disabled={isScanning}
                  />
                  <span className="text-sm font-medium w-12 text-center">{radius}</span>
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
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{error}</p>
                  {apiTip && (
                    <div className="mt-2 text-sm whitespace-pre-line">
                      <p>{apiTip}</p>
                    </div>
                  )}
                  {errorDetails && (
                    <div className="mt-2 text-sm whitespace-pre-line border-t border-destructive/20 pt-2">
                      <p>{errorDetails}</p>
                      {error.includes('Google Maps API') && (
                        <a 
                          href="https://console.cloud.google.com/billing" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-destructive hover:underline"
                        >
                          Check Google Cloud Billing <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {apiTip && !error && (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-4 flex items-start dark:bg-blue-900/20 dark:text-blue-400">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm whitespace-pre-line">{apiTip}</p>
              </div>
            )}
            
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
