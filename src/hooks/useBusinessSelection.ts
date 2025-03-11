
import { useState } from 'react';
import { Business } from '@/types/business';

export function useBusinessSelection() {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [highlightedBusinesses, setHighlightedBusinesses] = useState<string[]>([]);

  const handleSelectBusiness = (id: string) => {
    setSelectedBusinesses(prev => {
      if (prev.includes(id)) {
        return prev.filter(businessId => businessId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleHighlightBusiness = (id: string) => {
    setHighlightedBusinesses(prev => {
      if (prev.includes(id)) {
        return prev.filter(businessId => businessId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const clearSelections = () => {
    setSelectedBusinesses([]);
  };

  const clearHighlights = () => {
    setHighlightedBusinesses([]);
  };

  const selectMultipleBusinesses = (ids: string[]) => {
    setSelectedBusinesses(ids);
  };

  const highlightMultipleBusinesses = (ids: string[]) => {
    setHighlightedBusinesses(ids);
  };

  return {
    selectedBusinesses,
    highlightedBusinesses,
    handleSelectBusiness,
    handleHighlightBusiness,
    clearSelections,
    clearHighlights,
    selectMultipleBusinesses,
    highlightMultipleBusinesses
  };
}
