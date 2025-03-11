
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import { getBusinesses } from '@/services/businessCrudService';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardStats from './dashboard/DashboardStats';
import DashboardControls from './dashboard/DashboardControls';
import DashboardList from './dashboard/DashboardList';
import DataManagement from './dashboard/DataManagement';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBusinessSelection } from '@/hooks/useBusinessSelection';
import { useBusinessFiltering } from '@/hooks/useBusinessFiltering';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [newlyAddedBusinesses, setNewlyAddedBusinesses] = useState<string[]>([]);
  
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
  } = useBusinessFiltering(businesses);

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
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const data = await getBusinesses();
        setBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
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
      <DashboardHeader 
        setBusinesses={setBusinesses} 
        setLoading={setLoading} 
        loading={loading} 
      />
      
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
