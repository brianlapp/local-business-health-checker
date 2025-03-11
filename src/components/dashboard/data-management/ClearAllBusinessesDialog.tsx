
import React from 'react';
import { Trash2, RefreshCcw, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { clearAllBusinesses } from '@/services/businessCrudService';

interface ClearAllBusinessesDialogProps {
  businessCount: number;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  onDataCleared: () => void;
}

const ClearAllBusinessesDialog: React.FC<ClearAllBusinessesDialogProps> = ({
  businessCount,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isDeleting,
  setIsDeleting,
  onDataCleared
}) => {
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
      
      // Provide more specific error information to the user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to clear data: ${errorMessage}. Please check console for details.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
  );
};

export default ClearAllBusinessesDialog;
