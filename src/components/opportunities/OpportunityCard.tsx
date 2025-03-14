
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Opportunity } from '@/types/opportunity';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import OpportunityDialog from './OpportunityDialog';
import OpportunityDeleteDialog from './OpportunityDeleteDialog';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onUpdate: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      applied: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-indigo-100 text-indigo-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold line-clamp-2">{opportunity.title}</CardTitle>
          <Badge className={getStatusColor(opportunity.status)}>{opportunity.status}</Badge>
        </div>
        <div className="text-sm text-gray-500">
          {opportunity.client_name ? `${opportunity.client_name} • ` : ''}
          {opportunity.source}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        {opportunity.description && (
          <p className="text-sm text-gray-700 line-clamp-3 mb-3">{opportunity.description}</p>
        )}
        
        <div className="space-y-2">
          {opportunity.budget_min && opportunity.budget_max && (
            <div className="text-sm">
              <span className="font-medium">Budget:</span>{' '}
              {opportunity.currency} {opportunity.budget_min.toLocaleString()} - {opportunity.budget_max.toLocaleString()}
            </div>
          )}
          
          {opportunity.location && (
            <div className="text-sm">
              <span className="font-medium">Location:</span>{' '}
              {opportunity.location} {opportunity.is_remote ? '(Remote OK)' : ''}
            </div>
          )}
          
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {opportunity.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {opportunity.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-xs text-gray-500">
          Updated {formatDate(opportunity.updated_at)}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      <OpportunityDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        opportunity={opportunity}
        onSuccess={() => {
          onUpdate();
          setIsEditDialogOpen(false);
        }}
      />

      <OpportunityDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        onSuccess={() => {
          onUpdate();
          setIsDeleteDialogOpen(false);
        }}
      />
    </Card>
  );
};

export default OpportunityCard;
