
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle: string;
  onSuccess: () => void;
}

const OpportunityDeleteDialog: React.FC<OpportunityDeleteDialogProps> = ({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  onSuccess
}) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);
      
      if (error) throw error;
      
      toast.success('Opportunity deleted');
      onSuccess();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error(error);
      onClose();
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the opportunity "{opportunityTitle}".
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OpportunityDeleteDialog;
