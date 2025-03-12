
import { useState, useMemo } from 'react';
import { Business } from '@/types/business';

export const useBusinessFiltering = (businesses: Business[], searchQuery: string = '') => {
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedBusinesses = useMemo(() => {
    // First filter by search query if provided
    let filtered = businesses;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = businesses.filter(business => 
        business.name.toLowerCase().includes(query) || 
        (business.website && business.website.toLowerCase().includes(query))
        // Remove reference to address since it's not in the Business type
      );
    }

    // Then sort the filtered businesses
    return [...filtered].sort((a, b) => {
      if (sortBy === 'score') {
        // For scores, higher is typically worse in our scoring system
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return sortOrder === 'asc' 
          ? scoreA - scoreB 
          : scoreB - scoreA;
      } else if (sortBy === 'name') {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortBy === 'date') {
        // Use last_checked property instead of created_at
        const dateA = a.last_checked ? new Date(a.last_checked).getTime() : 0;
        const dateB = b.last_checked ? new Date(b.last_checked).getTime() : 0;
        return sortOrder === 'asc'
          ? dateA - dateB
          : dateB - dateA;
      }
      return 0;
    });
  }, [businesses, sortBy, sortOrder, searchQuery]);

  return {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    filteredAndSortedBusinesses
  };
};
