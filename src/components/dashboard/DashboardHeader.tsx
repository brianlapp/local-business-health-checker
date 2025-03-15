
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getBusinesses } from '@/services/businessService';

interface DashboardHeaderProps {
  setBusinesses: (businesses: any[]) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  setBusinesses, 
  setLoading, 
  loading 
}) => {
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getBusinesses();
      setBusinesses(data);
      toast.success("Business data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 className="text-3xl font-bold">Business Scanner</h2>
        <p className="text-muted-foreground">Find and analyze local business websites</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Link to="/add-business">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </Link>
        <Link to="/scan-manager">
          <Button variant="outline">
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Manager
          </Button>
        </Link>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
