
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, ArrowUpDown, Grid, List } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardControlsProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: 'score' | 'name' | 'date';
  setSortBy: (sort: 'score' | 'name' | 'date') => void;
  toggleSortOrder: () => void;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  toggleSortOrder
}) => {
  return (
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
  );
};

export default DashboardControls;
