
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpDown } from 'lucide-react';

interface ResultsHeaderProps {
  resultCount: number;
  source: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: string;
  onViewModeChange: (value: string) => void;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  resultCount,
  source,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">Results</h2>
        <div className="text-sm text-muted-foreground">
          Found {resultCount} jobs from {source}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <span>Sort by</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Posted</SelectItem>
            <SelectItem value="salary">Salary</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        
        <Tabs value={viewMode} onValueChange={onViewModeChange} className="w-[180px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default ResultsHeader;
