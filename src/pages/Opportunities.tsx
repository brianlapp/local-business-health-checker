
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, SlidersHorizontal, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/types/opportunity';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import OpportunityDialog from '@/components/opportunities/OpportunityDialog';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityEmptyState from '@/components/opportunities/OpportunityEmptyState';
import OpportunityLoadingState from '@/components/opportunities/OpportunityLoadingState';
import OpportunityHeader from '@/components/opportunities/OpportunityHeader';
import EvaluationCriteriaForm from '@/components/opportunities/EvaluationCriteriaForm';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useOpportunityEvaluation } from '@/hooks/useOpportunityEvaluation';

const Opportunities: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    evaluationCriteria, 
    setEvaluationCriteria, 
    loadUserCriteria,
    evaluateMultipleOpportunities,
    isEvaluating
  } = useOpportunityEvaluation();

  // Fetch opportunities when component mounts
  useEffect(() => {
    fetchOpportunities();
    loadUserCriteria();
  }, []);

  const fetchOpportunities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setOpportunities(data as Opportunity[]);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOpportunities = () => {
    if (activeTab === 'all') return opportunities;
    
    if (activeTab === 'priority') {
      return opportunities.filter(opp => opp.is_priority);
    }
    
    // Filter by status
    return opportunities.filter(opp => opp.status === activeTab);
  };

  const handleBulkEvaluate = async () => {
    if (!user) return;
    
    try {
      await evaluateMultipleOpportunities(opportunities);
      toast.success('Opportunities evaluated successfully');
      await fetchOpportunities(); // Reload with updated scores
    } catch (error) {
      console.error('Error evaluating opportunities:', error);
      toast.error('Failed to evaluate opportunities');
    }
  };

  // If user is not logged in or still loading, show loading state
  if (!user) {
    return <OpportunityLoadingState />;
  }

  const filteredOpportunities = getFilteredOpportunities();

  return (
    <div className="container py-8">
      <OpportunityHeader 
        title="Opportunities" 
        description="Manage and track your potential client opportunities"
      >
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Criteria
              </Button>
            </SheetTrigger>
            <SheetContent>
              <EvaluationCriteriaForm 
                criteria={evaluationCriteria}
                onChange={setEvaluationCriteria}
              />
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBulkEvaluate}
            disabled={isEvaluating || opportunities.length === 0}
          >
            {isEvaluating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            Evaluate All
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchOpportunities}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Button>
        </div>
      </OpportunityHeader>
      
      {loading ? (
        <OpportunityLoadingState />
      ) : opportunities.length === 0 ? (
        <OpportunityEmptyState onAddClick={() => setIsAddDialogOpen(true)} />
      ) : (
        <>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
              <TabsTrigger value="applied">Applied</TabsTrigger>
              <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="priority">Priority</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onUpdate={fetchOpportunities}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
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
