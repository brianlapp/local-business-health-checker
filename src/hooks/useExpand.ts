
import { useState } from 'react';

export function useExpand(initialState: boolean = false) {
  const [expanded, setExpanded] = useState(initialState);
  
  const toggleExpanded = () => setExpanded(!expanded);
  
  const handleToggleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded();
  };
  
  return {
    expanded,
    setExpanded,
    toggleExpanded,
    handleToggleButtonClick
  };
}
