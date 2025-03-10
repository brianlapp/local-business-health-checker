
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, AlertCircle, Info } from 'lucide-react';
import { scanBusinessesInArea } from '@/services/apiService';
import { Business } from '@/types/business';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MapScanner = () => {
  const [location, setLocation] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedBusinesses, setScannedBusinesses] = useState<Business[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiTip, setApiTip] = useState<string | null>(null);
  const [source, setSource] = useState('yellowpages');
  const [usingMockData, setUsingMockData] = useState(false);
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
    setUsingMockData(false);
    
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
      const businesses = await scanBusinessesInArea(location, source);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Check if businesses have the mock data source flag
      const mockDataCheck = businesses.some(b => b.source === 'mock-data');
      setUsingMockData(mockDataCheck);
      
      if (businesses.length === 0) {
        setError(`No businesses found in ${location}. Try a different location or data source.`);
        toast.info('No businesses found in this area. Try a different search.');
        setApiTip('Try using a more specific location or a different area. Make sure to include the city and country.');
      } else {
        setScannedBusinesses(businesses);
        
        if (mockDataCheck) {
          toast.success(`Found ${businesses.length} sample businesses for ${location}`);
          setApiTip('We\'re showing sample data because our scraper couldn\'t access the real business directory. For production use, you would need to integrate with a business data API like Google Places or Yelp.');
        } else {
          toast.success(`Found ${businesses.length} businesses in ${location}`);
        }
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setProgress(100);
      
      setError(error.message || 'Failed to scan area, please try again');
      toast.error('Failed to scan area: ' + (error.message || 'Unknown error'));
      
      if (error.message && error.message.includes('Edge Function')) {
        setApiTip('There was an issue with the web scraper. This could be a temporary issue with the website we\'re scraping or with our edge function. Please try again later or try a different data source.');
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleViewAll = () => {
    navigate('/');
  };
  
  const dataSources = [
    { value: 'yellowpages', label: 'Yellow Pages' },
    { value: 'localstack', label: 'LocalStack' },
    // Add more sources as they get implemented
  ];
  
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
                  Choose where to scrape business data from
                </p>
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
            {usingMockData && !error && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-4 flex items-start dark:bg-amber-900/20 dark:text-amber-400">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Demo Mode Active</p>
                  <p className="text-sm">You're viewing sample business data. In a production environment, you'd connect to a business data API.</p>
                </div>
              </div>
            )}
            
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
