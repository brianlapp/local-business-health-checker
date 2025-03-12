
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { getBusinesses, scanWithLighthouse } from '@/services/businessService';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import DashboardControls from './dashboard/DashboardControls';
import DashboardList from './dashboard/DashboardList';
import DataManagement from './dashboard/DataManagement';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';
import { useBusinessFiltering } from '@/hooks/useBusinessFiltering';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

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
  
  const location = useLocation();
  
  // Use our custom hooks
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

  // Check if there are newly added businesses from the location state
  useEffect(() => {
    if (location.state?.newBusinesses && Array.isArray(location.state.newBusinesses)) {
      const newIds = location.state.newBusinesses.map((b: Business) => b.id);
      setNewlyAddedBusinesses(newIds);
      
      // Clear the newly added businesses after 10 seconds
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
        
        // Start scanning unscanned businesses
        const unscannedBusinesses = data.filter(b => !b.lighthouse_score && !b.lighthouseScore);
        
        if (unscannedBusinesses.length > 0) {
          toast.info(`Scanning ${unscannedBusinesses.length} businesses for performance data...`);
          
          // Scan businesses sequentially to avoid rate limits
          for (const business of unscannedBusinesses) {
            try {
              await scanWithLighthouse(business.id, business.website);
            } catch (error) {
              console.error(`Error scanning ${business.name}:`, error);
            }
          }
          
          // Refresh the business list after scanning
          const updatedData = await getBusinesses();
          setBusinesses(updatedData || []);
          toast.success('Performance scan complete!');
        } else {
          setBusinesses(data || []);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndScanBusinesses();
  }, [dataRefreshKey]);

  const handleDataRefresh = () => {
    console.log('Data refresh triggered');
    // Force immediate data refresh by updating the refresh key
    setDataRefreshKey(prev => prev + 1);
    // Clear any selections
    clearSelections();
  };

  return (
    <div className={cn('container py-8', className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <DashboardHeader 
          setBusinesses={setBusinesses} 
          setLoading={setLoading} 
          loading={loading} 
        />
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search businesses..." 
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
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
