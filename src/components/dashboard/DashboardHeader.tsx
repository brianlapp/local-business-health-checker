
import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const handleRefresh = async () => {
    setLoading(true);
    const data = await getBusinesses();
    setBusinesses(data);
    setLoading(false);
    toast({
      description: "Business data refreshed",
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 className="text-3xl font-bold">Business Scanner</h2>
        <p className="text-muted-foreground">Find and analyze local business websites</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Link to="/map-scanner">
          <Button>
            <Map className="mr-2 h-4 w-4" />
            Scan Area
          </Button>
        </Link>
        <Link to="/add-business">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Business
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
