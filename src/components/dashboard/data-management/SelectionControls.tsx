
import React from 'react';
import { CheckSquare, Square, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Business } from '@/types/business';

interface SelectionControlsProps {
  selectedBusinesses: string[];
  businesses: Business[];
  toggleSelectAll: () => void;
  toggleBulkSelection: () => void;
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedBusinesses,
  businesses,
  toggleSelectAll,
  toggleBulkSelection
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleSelectAll}
      >
        {selectedBusinesses.length === businesses.length ? (
          <>
            <Square className="mr-2 h-4 w-4" />
            Deselect All
          </>
        ) : (
          <>
            <CheckSquare className="mr-2 h-4 w-4" />
            Select All
          </>
        )}
      </Button>

      <Button 
        variant="secondary" 
        size="sm" 
        onClick={toggleBulkSelection}
      >
        <Check className="mr-2 h-4 w-4" />
        Done
      </Button>
    </>
  );
};

export default SelectionControls;
