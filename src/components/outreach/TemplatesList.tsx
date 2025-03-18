
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ProposalTemplate, 
  getProposalTemplates, 
  deleteProposalTemplate 
} from '@/services/outreach/templateService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash, Copy, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TemplatesListProps {
  onEditTemplate: (template: ProposalTemplate) => void;
  onCreateTemplate: () => void;
  onRefresh?: () => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({ 
  onEditTemplate, 
  onCreateTemplate,
  onRefresh 
}) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateToDelete, setTemplateToDelete] = useState<ProposalTemplate | null>(null);
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getProposalTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      const success = await deleteProposalTemplate(templateToDelete.id);
      if (success) {
        setTemplates(templates.filter(t => t.id !== templateToDelete.id));
        toast.success('Template deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setTemplateToDelete(null);
    }
  };
  
  const categoryLabel = (category: string) => {
    switch (category) {
      case 'business': return 'Business';
      case 'opportunity': return 'Opportunity';
      case 'agency': return 'Agency';
      default: return category;
    }
  };
  
  const refresh = () => {
    fetchTemplates();
    onRefresh?.();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposal Templates</h2>
        <Button onClick={onCreateTemplate}>Create Template</Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No templates found</p>
          <Button 
            variant="outline" 
            onClick={onCreateTemplate} 
            className="mt-2"
          >
            Create your first template
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{categoryLabel(template.category || '')}</TableCell>
                <TableCell>
                  {template.is_default ? <Check size={16} className="text-green-500" /> : '—'}
                </TableCell>
                <TableCell>
                  {template.updated_at ? format(new Date(template.updated_at), 'MMM d, yyyy') : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTemplate(template)}>
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(template.content);
                        toast.success('Template content copied to clipboard');
                      }}>
                        <Copy size={16} className="mr-2" />
                        Copy Content
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setTemplateToDelete(template)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatesList;
