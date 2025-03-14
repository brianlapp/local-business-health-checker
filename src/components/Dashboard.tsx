import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { getBusinesses, scanWithLighthouse, getBusinessesNeedingRealScores } from '@/services/businessService';
import { supabase } from '@/lib/supabase';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import DashboardControls from './dashboard/DashboardControls';
import DashboardList from './dashboard/DashboardList';
import DataManagement from './dashboard/DataManagement';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Search, InfoIcon, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';
import { useBusinessFiltering } from '@/hooks/useBusinessFiltering';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [newlyAddedBusinesses, setNewlyAddedBusinesses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [totalToScan, setTotalToScan] = useState(0);
  const [rateResumeTime, setRateResumeTime] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isRetryingEstimates, setIsRetryingEstimates] = useState(false);

  const location = useLocation();
  
  const { 
    selectedBusinesses, 
    handleSelectBusiness,
    clearSelections,
    selectMultipleBusinesses 
  } = useBusinessSelection();
  
  const {
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    filteredAndSortedBusinesses
  } = useBusinessFiltering(businesses, searchQuery);

  useEffect(() => {
    if (location.state?.newBusinesses && Array.isArray(location.state.newBusinesses)) {
      const newIds = location.state.newBusinesses.map((b: Business) => b.id);
      setNewlyAddedBusinesses(newIds);
      
      const timer = setTimeout(() => {
        setNewlyAddedBusinesses([]);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchAndScanBusinesses = async () => {
      setLoading(true);
      try {
        const data = await getBusinesses();
        
        const unscannedBusinesses = data.filter(b => !b.lighthouse_score && !b.lighthouseScore);
        
        if (unscannedBusinesses.length > 0) {
          setTotalToScan(unscannedBusinesses.length);
          setScanningProgress(0);
          toast.info(`Scanning ${unscannedBusinesses.length} businesses for performance data...`);
          
          let rateLimitCount = 0;
          
          for (let i = 0; i < unscannedBusinesses.length; i++) {
            const business = unscannedBusinesses[i];
            try {
              if (i > 0) {
                const delay = 3000 + Math.random() * 2000;
                await new Promise(resolve => setTimeout(resolve, delay));
              }
              
              const result = await scanWithLighthouse(business.id, business.website);
              
              if (result && result.reportUrl && result.note) {
                if (result.note.includes('Resuming in')) {
                  const timeMatch = result.note.match(/Resuming in ~(\d+) minutes/);
                  if (timeMatch && timeMatch[1]) {
                    const minutes = parseInt(timeMatch[1]);
                    const resumeTime = new Date();
                    resumeTime.setMinutes(resumeTime.getMinutes() + minutes);
                    
                    setRateResumeTime(resumeTime.toLocaleTimeString());
                    setIsRateLimited(true);
                    
                    break;
                  }
                }
                
                if (result.note.includes('rate limited')) {
                  rateLimitCount++;
                  
                  if (rateLimitCount <= 3) {
                    toast.warning(`Rate limit encountered for ${business.name}. Skipping for now.`);
                  } 
                  
                  if (rateLimitCount >= 3 && !rateLimitWarning) {
                    setRateLimitWarning(true);
                  }
                }
              }
              
              setScanningProgress(i + 1);
            } catch (error) {
              console.error(`Error scanning ${business.name}:`, error);
            }
          }
          
          const updatedData = await getBusinesses();
          setBusinesses(updatedData || []);
          
          if (isRateLimited) {
            toast.warning(`Performance scan paused due to rate limiting. Will resume at ${rateResumeTime}`);
          } else if (rateLimitCount > 0) {
            toast.info(`Performance scan complete with ${rateLimitCount} rate-limited results`);
          } else {
            toast.success('Performance scan complete!');
          }
        } else {
          setBusinesses(data || []);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
        setScanningProgress(0);
        setTotalToScan(0);
      }
    };

    fetchAndScanBusinesses();
  }, [dataRefreshKey]);

  const handleDataRefresh = () => {
    console.log('Data refresh triggered');
    setDataRefreshKey(prev => prev + 1);
    clearSelections();
    setRateLimitWarning(false);
    setIsRateLimited(false);
    setRateResumeTime(null);
  };

  const handleRetryEstimates = async () => {
    setIsRetryingEstimates(true);
    try {
      const businessIds = await getBusinessesNeedingRealScores();
      
      if (businessIds.length === 0) {
        toast.info("No businesses needing score updates found.");
        setIsRetryingEstimates(false);
        return;
      }
      
      toast.info(`Retrying to scan ${businessIds.length} businesses...`);
      
      const { data: businessesToRetry } = await supabase
        .from('businesses')
        .select('*')
        .in('id', businessIds);
      
      setTotalToScan(businessesToRetry.length);
      
      for (let i = 0; i < businessesToRetry.length; i++) {
        const business = businessesToRetry[i];
        
        if (i > 0) {
          const delay = 5000 + Math.random() * 5000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        try {
          const result = await scanWithLighthouse(business.id, business.website);
          setScanningProgress(i + 1);
          
          if (result && result.note && result.note.includes('Resuming in')) {
            const timeMatch = result.note.match(/Resuming in ~(\d+) minutes/);
            if (timeMatch && timeMatch[1]) {
              const minutes = parseInt(timeMatch[1]);
              const resumeTime = new Date();
              resumeTime.setMinutes(resumeTime.getMinutes() + minutes);
              
              setRateResumeTime(resumeTime.toLocaleTimeString());
              setIsRateLimited(true);
              
              break;
            }
          }
        } catch (error) {
          console.error(`Error retrying scan for ${business.name}:`, error);
        }
      }
      
      const refreshedData = await getBusinesses();
      setBusinesses(refreshedData || []);
      
      if (isRateLimited) {
        toast.warning(`Retry paused due to rate limiting. Will resume at ${rateResumeTime}`);
      } else {
        toast.success("Retry complete!");
      }
    } catch (error) {
      console.error("Error retrying scans:", error);
      toast.error("Failed to retry scans");
    } finally {
      setIsRetryingEstimates(false);
      setScanningProgress(0);
      setTotalToScan(0);
    }
  };

  return (
    <div className={cn('container py-8', className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <DashboardHeader 
          setBusinesses={setBusinesses} 
          setLoading={setLoading} 
          loading={loading} 
        />
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search businesses..." 
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Link to="/map-scanner">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Scan Area
            </Button>
          </Link>
        </div>
      </div>
      
      {isRateLimited && (
        <Alert className="mb-6 bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>API Rate Limiting - Scanning Paused</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Google's API rate limit has been reached. Scanning has been paused and will resume automatically
              {rateResumeTime ? ` at approximately ${rateResumeTime}` : ' soon'}.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {rateLimitWarning && !isRateLimited && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Some API Rate Limiting Detected</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Google's API rate limits have been reached for some businesses. Some websites could not be scanned.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit mt-2"
              onClick={handleRetryEstimates}
              disabled={isRetryingEstimates}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetryingEstimates ? 'animate-spin' : ''}`} />
              Retry Scanning
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {(scanningProgress > 0 && totalToScan > 0) && (
        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>{isRetryingEstimates ? "Retrying estimated scores" : "Scanning in progress"}</AlertTitle>
          <AlertDescription>
            <div>Processing website {scanningProgress} of {totalToScan}</div>
            <div className="w-full bg-blue-200 rounded-full h-2.5 my-2 dark:bg-blue-900">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(scanningProgress / totalToScan) * 100}%` }}
              ></div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {newlyAddedBusinesses.length > 0 && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {newlyAddedBusinesses.length} new businesses added from your scan! 
            They've been highlighted below.
          </AlertDescription>
        </Alert>
      )}
      
      <DashboardStats businesses={businesses} />
      
      <DashboardControls 
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        toggleSortOrder={toggleSortOrder}
      />
      
      <DataManagement 
        businessCount={businesses.length} 
        onDataCleared={handleDataRefresh}
        selectedBusinesses={selectedBusinesses}
        setSelectedBusinesses={selectMultipleBusinesses}
        businesses={businesses}
      />
      
      <DashboardList 
        businesses={filteredAndSortedBusinesses} 
        loading={loading} 
        viewMode={viewMode}
        onBusinessUpdate={setBusinesses}
        selectedBusinesses={selectedBusinesses}
        setSelectedBusinesses={selectMultipleBusinesses}
        onSelectBusiness={handleSelectBusiness}
        highlightedBusinesses={newlyAddedBusinesses}
      />
    </div>
  );
};

export default Dashboard;
