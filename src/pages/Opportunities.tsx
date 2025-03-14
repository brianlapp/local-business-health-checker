
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunity';
import { useAuth } from '@/contexts/AuthContext';
import OpportunityDialog from '@/components/opportunities/OpportunityDialog';
import OpportunityHeader from '@/components/opportunities/OpportunityHeader';
import OpportunityList from '@/components/opportunities/OpportunityList';
import OpportunityEmptyState from '@/components/opportunities/OpportunityEmptyState';
import OpportunityLoadingState from '@/components/opportunities/OpportunityLoadingState';
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

  const handleAddOpportunity = () => {
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
  };

  const handleDialogSuccess = () => {
    fetchOpportunities();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="container py-8">
      <OpportunityHeader onAddClick={handleAddOpportunity} />

      {loading ? (
        <OpportunityLoadingState />
      ) : opportunities.length === 0 ? (
        <OpportunityEmptyState onAddClick={handleAddOpportunity} />
      ) : (
        <OpportunityList 
          opportunities={opportunities} 
          onUpdate={fetchOpportunities} 
        />
      )}

      <OpportunityDialog
        isOpen={isAddDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default Opportunities;
