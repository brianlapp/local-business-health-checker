
import { useState, useCallback } from 'react';

/**
 * Custom hook for managing expandable/collapsible UI elements
 * @param initialState - Initial expanded state (default: false)
 * @returns Object containing expanded state and helper functions
 */
export function useExpand(initialState: boolean = false) {
  const [expanded, setExpanded] = useState(initialState);
  
  // Use useCallback to prevent unnecessary re-renders
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // Stop propagation for nested clickable elements
  const handleToggleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded();
  }, [toggleExpanded]);
  
  return {
    expanded,
    setExpanded,
    toggleExpanded,
    handleToggleButtonClick
  };
}
