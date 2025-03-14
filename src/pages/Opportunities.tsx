
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunity';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityDialog from '@/components/opportunities/OpportunityDialog';

const Opportunities: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: opportunities, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Opportunity[];
    }
  });

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateDialogOpen(false);
  };

  if (error) {
    return <div className="container mx-auto p-4">Error loading opportunities: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Freelance Opportunities</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !opportunities || opportunities.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No opportunities found</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Add Your First Opportunity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => (
            <OpportunityCard 
              key={opportunity.id} 
              opportunity={opportunity} 
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      <OpportunityDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Opportunities;
