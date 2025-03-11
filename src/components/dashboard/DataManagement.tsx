
import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Business } from '@/types/business';
import ClearAllBusinessesDialog from './data-management/ClearAllBusinessesDialog';
import DeleteSelectedBusinesses from './data-management/DeleteSelectedBusinesses';
import SelectionControls from './data-management/SelectionControls';

interface DataManagementProps {
  businessCount: number;
  onDataCleared: () => void;
  selectedBusinesses: string[];
  setSelectedBusinesses: React.Dispatch<React.SetStateAction<string[]>>;
  businesses: Business[];
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  businessCount, 
  onDataCleared, 
  selectedBusinesses,
  setSelectedBusinesses,
  businesses
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);

  const toggleBulkSelection = () => {
    setBulkSelectionMode(!bulkSelectionMode);
    if (selectedBusinesses.length > 0) {
      setSelectedBusinesses([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedBusinesses.length === businesses.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(businesses.map(b => b.id));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {!bulkSelectionMode ? (
        <>
          <ClearAllBusinessesDialog
            businessCount={businessCount}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
            onDataCleared={onDataCleared}
          />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleBulkSelection}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Select Businesses
          </Button>
        </>
      ) : (
        <>
          <DeleteSelectedBusinesses
            selectedBusinesses={selectedBusinesses}
            isDeleting={isDeleting}
            setIsDeleting={setIsDeleting}
            onDataCleared={onDataCleared}
            setBulkSelectionMode={setBulkSelectionMode}
            setSelectedBusinesses={setSelectedBusinesses}
          />

          <SelectionControls
            selectedBusinesses={selectedBusinesses}
            businesses={businesses}
            toggleSelectAll={toggleSelectAll}
            toggleBulkSelection={toggleBulkSelection}
          />
        </>
      )}
    </div>
  );
};

export default DataManagement;
