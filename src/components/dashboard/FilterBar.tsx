
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FilterBarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  placeholder = "Search businesses...",
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="pl-9 w-full max-w-xs"
      />
    </div>
  );
};

export default FilterBar;
