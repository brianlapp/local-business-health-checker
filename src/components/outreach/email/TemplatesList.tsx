
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailTemplate } from '@/types/emailTemplate';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteEmailTemplate } from '@/services/outreach/templates/emailTemplateService';

interface TemplatesListProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  onEdit: (template: EmailTemplate) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const TemplatesList: React.FC<TemplatesListProps> = ({
  templates,
  isLoading,
  onEdit,
  onCreate,
  onDelete,
}) => {
  const handleDelete = async (id: string) => {
    const success = await deleteEmailTemplate(id);
    if (success) {
      onDelete(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Templates</CardTitle>
        <Button size="sm" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first email template to get started with outreach.
            </p>
            <Button className="mt-4" onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {template.name}
                      {template.is_default && (
                        <Badge variant="outline" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Subject: {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created:{" "}
                      {template.created_at
                        ? format(new Date(template.created_at), "MMM d, yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete email template?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the "{template.name}" template.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatesList;
