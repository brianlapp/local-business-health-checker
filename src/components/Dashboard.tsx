
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Business } from '@/types/business';
import BusinessCard from './BusinessCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, RefreshCw, ArrowUpDown, Map, Grid, List, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBusinesses } from '@/services/businessService';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      const data = await getBusinesses();
      setBusinesses(data);
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await getBusinesses();
    setBusinesses(data);
    setLoading(false);
    toast({
      description: "Business data refreshed",
    });
  };

  const sortedBusinesses = [...businesses].sort((a, b) => {
    if (sortBy === 'score') {
      return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
    } else if (sortBy === 'name') {
      return sortOrder === 'desc' 
        ? b.name.localeCompare(a.name) 
        : a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      const dateA = a.lastChecked ? new Date(a.lastChecked) : new Date(0);
      const dateB = b.lastChecked ? new Date(b.lastChecked) : new Date(0);
      return sortOrder === 'desc' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className={cn('container py-8', className)}>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="animate-fade-in delay-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{businesses.length}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Shit Score™</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {businesses.length > 0 
                ? Math.round(businesses.reduce((acc, cur) => acc + cur.score, 0) / businesses.length) 
                : 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{businesses.filter(b => b.score >= 80).length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          
          <div className="ml-4 flex items-center">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as any)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Shit Score™</SelectItem>
                <SelectItem value="name">Business Name</SelectItem>
                <SelectItem value="date">Last Checked</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No businesses found</h3>
          <p className="text-muted-foreground mt-2">Try scanning a new area or adding businesses manually</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        )}>
          {sortedBusinesses.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business}
              className="animate-slide-up"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
