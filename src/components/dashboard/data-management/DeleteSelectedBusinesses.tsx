
import React from 'react';
import { Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { clearSelectedBusinesses } from '@/services/businessCrudService';

interface DeleteSelectedBusinessesProps {
  selectedBusinesses: string[];
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  onDataCleared: () => void;
  setBulkSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBusinesses: React.Dispatch<React.SetStateAction<string[]>>;
}

const DeleteSelectedBusinesses: React.FC<DeleteSelectedBusinessesProps> = ({
  selectedBusinesses,
  isDeleting,
  setIsDeleting,
  onDataCleared,
  setBulkSelectionMode,
  setSelectedBusinesses
}) => {
  const handleDeleteSelected = async () => {
    if (selectedBusinesses.length === 0) {
      toast.warning('No businesses selected');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting selected businesses:', selectedBusinesses);
      const result = await clearSelectedBusinesses(selectedBusinesses);
      console.log('Delete selected result:', result);
      
      onDataCleared();
      toast.success(`${selectedBusinesses.length} businesses deleted`);
      setSelectedBusinesses([]);
      setBulkSelectionMode(false);
    } catch (error) {
      console.error('Error deleting businesses:', error);
      toast.error('Failed to delete selected businesses');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant={selectedBusinesses.length > 0 ? "destructive" : "outline"}
      size="sm" 
      onClick={handleDeleteSelected}
      disabled={selectedBusinesses.length === 0 || isDeleting}
    >
      {isDeleting ? (
        <>
          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected ({selectedBusinesses.length})
        </>
      )}
    </Button>
  );
};

export default DeleteSelectedBusinesses;
