
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToggleExpandButtonProps {
  expanded: boolean;
  onClick: (e: React.MouseEvent) => void;
  title?: string;
}

const ToggleExpandButton: React.FC<ToggleExpandButtonProps> = ({ 
  expanded, 
  onClick,
  title = expanded ? 'Collapse' : 'Expand'
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="ml-2"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {expanded ? 
        <ChevronUp className="h-4 w-4" /> : 
        <ChevronDown className="h-4 w-4" />
      }
    </Button>
  );
};

export default ToggleExpandButton;
