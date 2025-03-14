
import { useState } from 'react';
import { Opportunity } from '@/types/opportunity';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useOpportunityForm(opportunity: Opportunity | undefined, userId: string | undefined, onSuccess: () => void) {
  const isEditing = !!opportunity;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(opportunity?.title || '');
  const [description, setDescription] = useState(opportunity?.description || '');
  const [source, setSource] = useState(opportunity?.source || 'job_board');
  const [sourceUrl, setSourceUrl] = useState(opportunity?.source_url || '');
  const [status, setStatus] = useState<Opportunity['status']>(opportunity?.status || 'new');
  const [clientName, setClientName] = useState(opportunity?.client_name || '');
  const [clientWebsite, setClientWebsite] = useState(opportunity?.client_website || '');
  const [location, setLocation] = useState(opportunity?.location || '');
  const [isRemote, setIsRemote] = useState(opportunity?.is_remote || false);
  const [budgetMin, setBudgetMin] = useState<number | undefined>(opportunity?.budget_min || undefined);
  const [budgetMax, setBudgetMax] = useState<number | undefined>(opportunity?.budget_max || undefined);
  const [currency, setCurrency] = useState(opportunity?.currency || 'USD');
  const [skills, setSkills] = useState(opportunity?.skills?.join(', ') || '');
  const [isPriority, setIsPriority] = useState(opportunity?.is_priority || false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('You must be logged in to add or edit opportunities');
      return;
    }
    
    if (!title || !source) {
      toast.error('Title and source are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process skills into an array
      const skillsArray = skills
        ? skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      // Prepare opportunity data object
      const opportunityData = {
        title,
        description,
        source,
        source_url: sourceUrl,
        status,
        client_name: clientName || null,
        client_website: clientWebsite || null,
        location: location || null,
        is_remote: isRemote,
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        currency,
        skills: skillsArray,
        is_priority: isPriority,
        user_id: userId
      };
      
      if (isEditing && opportunity) {
        // Update existing opportunity
        const { error } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', opportunity.id);
          
        if (error) throw error;
        
        toast.success('Opportunity updated successfully');
      } else {
        // Create new opportunity
        const { error } = await supabase
          .from('opportunities')
          .insert(opportunityData);
          
        if (error) throw error;
        
        toast.success('Opportunity created successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error('Error saving opportunity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isEditing,
    isSubmitting,
    formValues: {
      title, setTitle,
      description, setDescription,
      source, setSource,
      sourceUrl, setSourceUrl,
      status, setStatus,
      clientName, setClientName,
      clientWebsite, setClientWebsite,
      location, setLocation,
      isRemote, setIsRemote,
      budgetMin, setBudgetMin,
      budgetMax, setBudgetMax,
      currency, setCurrency,
      skills, setSkills,
      isPriority, setIsPriority
    },
    handleSubmit
  };
}
