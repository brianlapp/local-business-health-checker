
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Business, ScanDebugInfo } from '@/types/business';
import { scanBusinessesInArea } from '@/services/scanningService';

// Import refactored components
import ScanForm from '@/components/map-scanner/ScanForm';
import ScanResults from '@/components/map-scanner/ScanResults';
import DebugInfoDisplay from '@/components/map-scanner/DebugInfoDisplay';
import AlertNotifications from '@/components/map-scanner/AlertNotifications';

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
  const [scanRadius, setScanRadius] = useState(5); // Default radius of 5km
  
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
      
      // Pass the scanRadius to the API call
      const response = await scanBusinessesInArea(finalLocation, scanRadius.toString(), debugMode ? 20 : 10);
      
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
        <ScanForm
          isScanning={isScanning}
          location={location}
          setLocation={setLocation}
          scanRadius={scanRadius}
          setScanRadius={setScanRadius}
          source={source}
          setSource={setSource}
          autoRedirect={autoRedirect}
          setAutoRedirect={setAutoRedirect}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
          onSubmit={handleSubmit}
          progress={progress}
        />
        
        <div className="md:col-span-2 space-y-4">
          <AlertNotifications
            error={error}
            apiTip={apiTip}
            apiTroubleshooting={apiTroubleshooting}
            source={source}
            usingMockData={usingMockData}
            scanComplete={scanComplete}
            scannedBusinesses={scannedBusinesses}
          />
          
          <DebugInfoDisplay debugInfo={debugInfo} />
          
          <ScanResults
            businesses={scannedBusinesses}
            location={location}
            isScanning={isScanning}
            scanComplete={scanComplete}
            scanRadius={scanRadius}
            handleViewResults={handleViewResults}
          />
        </div>
      </div>
    </div>
  );
};

export default MapScanner;
