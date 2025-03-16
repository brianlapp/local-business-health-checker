
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2, AlertCircle, Info, Bug, ExternalLink, ArrowRight, Check } from 'lucide-react';
import { scanBusinessesInArea } from '@/services/apiService';
import { Business, ScanDebugInfo, BusinessScanResponse } from '@/types/business';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MapScanner = () => {
  const [location, setLocation] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedBusinesses, setScannedBusinesses] = useState<Business[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiTip, setApiTip] = useState<string | null>(null);
  const [apiTroubleshooting, setApiTroubleshooting] = useState<string | null>(null);
  const [source, setSource] = useState('google'); // Default to Google Maps API
  const [usingMockData, setUsingMockData] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<ScanDebugInfo | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(false);
  
  const navigate = useNavigate();
  
  const formatLocation = (locationStr: string): string => {
    return locationStr.replace(/\s+/g, ' ').trim().replace(/\s*,\s*/g, ', ');
  };
  
  const validateCanadianLocation = (location: string): boolean => {
    const locationParts = location.split(',').map(part => part.trim());
    
    if (locationParts.length === 3) {
      const country = locationParts[2].toLowerCase();
      return country === 'canada' || country === 'ca';
    }
    
    if (locationParts.length === 2) {
      return true;
    }
    
    return false;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error('Please enter a location to scan');
      return;
    }
    
    setScanComplete(false);
    
    const formattedLocation = formatLocation(location);
    const locationParts = formattedLocation.split(',').map(part => part.trim());
    
    if (!validateCanadianLocation(formattedLocation)) {
      toast.warning('Please enter a valid Canadian location');
      setApiTip('For best results, use the format "City, Province" or "City, Province, Canada" (e.g. "Toronto, Ontario" or "Vancouver, BC, Canada")');
      if (locationParts.length < 2) {
        return;
      }
    }
    
    let finalLocation = formattedLocation;
    if (locationParts.length === 2) {
      finalLocation = `${formattedLocation}, Canada`;
    }
    
    setIsScanning(true);
    setProgress(0);
    setScannedBusinesses([]);
    setError(null);
    setApiTip(null);
    setApiTroubleshooting(null);
    setUsingMockData(false);
    setDebugInfo(null);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      toast.info(`Scanning for businesses in ${finalLocation}...`);
      
      console.log(`Starting business scan for ${finalLocation} with source ${source}, debug mode: ${debugMode}`);
      
      // Fixed: Passing source as string and adding a default radius of 5 as number
      const response = await scanBusinessesInArea(finalLocation, 5, debugMode ? 20 : 10);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Scan response:', response);
      
      let businesses: Business[] = [];
      let testMode = false;
      let hasError = false;
      
      if (Array.isArray(response)) {
        businesses = response;
      } else if ('businesses' in response) {
        businesses = response.businesses;
        
        if ('test_mode' in response) {
          testMode = response.test_mode;
        }
        
        if ('troubleshooting' in response && response.troubleshooting) {
          setApiTroubleshooting(response.troubleshooting);
        }
        
        if (debugMode && response.debugInfo) {
          setDebugInfo(response.debugInfo as ScanDebugInfo);
          console.log('Debug info received and stored:', response.debugInfo);
        }
        
        if ('error' in response && response.error && businesses.length === 0) {
          setError(response.error);
          hasError = true;
          if ('message' in response && response.message) {
            setApiTip(response.message);
          }
        }
      }
      
      const isMockData = testMode || 
        (businesses.length > 0 && businesses.every(b => b.id && b.id.startsWith('mock-')));
      
      setUsingMockData(isMockData);
      
      if (businesses.length === 0 && !hasError) {
        setError(`No businesses found in ${finalLocation}. Try a different location or data source.`);
        toast.info('No businesses found in this area. Try a different search.');
        setApiTip('Try using a more specific location or a different area. Make sure to include the city and province in the format "City, Province" or "City, Province, Canada".');
      } else if (businesses.length > 0) {
        setScannedBusinesses(businesses);
        setScanComplete(true);
        
        if (isMockData) {
          toast.success(`Found ${businesses.length} sample businesses for ${finalLocation}`);
          if (!apiTip) {
            setApiTip('We\'re showing sample data because the API couldn\'t access real business data for this location.');
          }
        } else {
          toast.success(`Found ${businesses.length} businesses in ${finalLocation}`);
        }
        
        if (autoRedirect) {
          setTimeout(() => {
            handleViewResults();
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      setProgress(100);
      
      setError(error.message || 'Failed to scan area, please try again');
      toast.error('Failed to scan area: ' + (error.message || 'Unknown error'));
      
      if (error.message && error.message.includes('Edge Function')) {
        setApiTip('There was an issue with our business search service. This could be a temporary issue. Please try again later or try a different data source.');
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleViewResults = () => {
    navigate('/', { 
      state: { 
        newBusinesses: scannedBusinesses,
        source: location
      } 
    });
  };
  
  const handleViewAll = () => {
    navigate('/');
  };
  
  const dataSources = [
    { value: 'google', label: 'Google Maps' },
    { value: 'yellowpages', label: 'Yellow Pages' },
    { value: 'localstack', label: 'LocalStack (Sample Data)' },
  ];
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Canadian Business Scanner</h2>
          <p className="text-muted-foreground">Find businesses in Canadian cities</p>
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardContent>
            {scanComplete && scannedBusinesses.length > 0 && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                <Check className="h-4 w-4" />
                <AlertTitle>Scan Complete!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Found {scannedBusinesses.length} businesses in {location}.</p>
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
            
            {error && source === 'google' && scannedBusinesses.length === 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Google Maps API Error</AlertTitle>
                <AlertDescription>
                  <p>{error}</p>
                  {apiTip && <p className="mt-1">{apiTip}</p>}
                  {apiTroubleshooting && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded-md text-sm">
                      <p className="font-medium">Troubleshooting:</p>
                      <p>{apiTroubleshooting}</p>
                      <a 
                        href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center mt-2 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Google Cloud Console - Enable Places API
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {usingMockData && !error && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-4 flex items-start dark:bg-amber-900/20 dark:text-amber-400">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Demo Mode Active</p>
                  <p className="text-sm">
                    You're viewing sample business data. In a production environment, you'd connect to a business data API.
                    {apiTip && <span className="block mt-1">{apiTip}</span>}
                  </p>
                </div>
              </div>
            )}
            
            {error && source !== 'google' && scannedBusinesses.length === 0 && (
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
            
            {apiTip && !error && !usingMockData && !scanComplete && (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-4 flex items-start dark:bg-blue-900/20 dark:text-blue-400">
                <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm whitespace-pre-line">{apiTip}</p>
              </div>
            )}
            
            {debugInfo && debugInfo.logs && debugInfo.logs.length > 0 && (
              <div className="bg-gray-50 text-gray-800 p-4 rounded-md mb-4 dark:bg-gray-900/20 dark:text-gray-400 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Debug Information
                  </h3>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded dark:bg-gray-800">
                    {debugInfo.logs.length} log entries
                  </span>
                </div>
                <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-60 overflow-y-auto">
                  {debugInfo.logs.map((log, i) => (
                    <div key={i} className="py-1">
                      {log}
                    </div>
                  ))}
                </div>
                
                {debugInfo.htmlSamples && debugInfo.htmlSamples.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">HTML Samples ({debugInfo.htmlSamples.length})</h4>
                    <div className="space-y-2">
                      {debugInfo.htmlSamples.map((sample, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold">{sample.url}</span>
                            <span>{sample.length} bytes</span>
                          </div>
                          <pre className="whitespace-pre-wrap overflow-x-auto max-h-20">
                            {sample.sample}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {scannedBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <p className="mt-2 text-muted-foreground">
                  {isScanning 
                    ? 'Scanning for Canadian businesses...' 
                    : 'No businesses scanned yet. Enter a Canadian location and start scanning.'}
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
