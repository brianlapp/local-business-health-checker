import React, { useState } from 'react';
import { Trash2, RefreshCcw, AlertOctagon, Check, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { clearAllBusinesses, clearSelectedBusinesses } from '@/services/businessCrudService';
import { Business } from '@/types/business';

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

  const handleClearAllData = async () => {
    setIsDeleting(true);
    try {
      console.log('Initiating clear all businesses operation');
      const result = await clearAllBusinesses();
      console.log('Clear all businesses result:', result);
      
      // Close dialog and trigger refresh immediately
      setIsDeleteDialogOpen(false);
      onDataCleared();
      
      // Show success message
      toast.success('All business data has been cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Business Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all {businessCount} businesses from the database. 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center bg-amber-50 text-amber-800 p-3 rounded-md dark:bg-amber-900/20 dark:text-amber-400">
                <AlertOctagon className="h-5 w-5 mr-2" />
                <span>All scans, scores, and business data will be lost.</span>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllData}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Yes, Clear Everything
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
      )}
    </div>
  );
};

export default DataManagement;
