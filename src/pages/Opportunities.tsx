
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunity';
import { useAuth } from '@/contexts/AuthContext';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import OpportunityDialog from '@/components/opportunities/OpportunityDialog';
import { toast } from 'sonner';

const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuth();

  const fetchOpportunities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOpportunities(data as Opportunity[]);
    } catch (error: any) {
      toast.error(`Error fetching opportunities: ${error.message}`);
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [user]);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Opportunities</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Opportunity
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No opportunities yet</h3>
          <p className="text-gray-500 mb-4">
            Start by adding job opportunities, client leads, or freelance projects.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Opportunity
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onUpdate={fetchOpportunities}
            />
          ))}
        </div>
      )}

      <OpportunityDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          fetchOpportunities();
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Opportunities;
