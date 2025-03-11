
import { useState, useMemo } from 'react';
import { Business } from '@/types/business';

type SortField = 'score' | 'name' | 'date';
type SortOrder = 'asc' | 'desc';

export function useBusinessFiltering(businesses: Business[]) {
  const [sortBy, setSortBy] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<string>('');

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedBusinesses = useMemo(() => {
    // First, filter businesses if a filter is applied
    let result = businesses;
    
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(business => 
        business.name.toLowerCase().includes(lowerFilter) || 
        business.website.toLowerCase().includes(lowerFilter)
      );
    }
    
    // Then sort the filtered results
    return [...result].sort((a, b) => {
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
  }, [businesses, sortBy, sortOrder, filter]);

  return {
    sortBy,
    setSortBy,
    sortOrder,
    toggleSortOrder,
    filter,
    setFilter,
    filteredAndSortedBusinesses
  };
}
