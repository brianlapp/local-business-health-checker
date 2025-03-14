
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Opportunity } from '@/types/opportunity';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

interface OpportunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: Opportunity;
  onSuccess: () => void;
}

const OpportunityDialog: React.FC<OpportunityDialogProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}) => {
  const { user } = useAuth();
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
    
    if (!user) {
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
        user_id: user.id
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Opportunity' : 'Add Opportunity'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="col-span-3" 
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                Source
              </Label>
              <Select 
                value={source} 
                onValueChange={(value: string) => setSource(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_board">Job Board</SelectItem>
                  <SelectItem value="recruiting_agency">Recruiting Agency</SelectItem>
                  <SelectItem value="direct_client">Direct Client</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source_url" className="text-right">
                Source URL
              </Label>
              <Input
                type="url"
                id="source_url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={(value: Opportunity['status']) => setStatus(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client_name" className="text-right">
                Client Name
              </Label>
              <Input
                type="text"
                id="client_name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client_website" className="text-right">
                Client Website
              </Label>
              <Input
                type="url"
                id="client_website"
                value={clientWebsite}
                onChange={(e) => setClientWebsite(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_remote" className="text-right">
                Remote
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="is_remote"
                  checked={isRemote}
                  onCheckedChange={(checked) => setIsRemote(checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  type="number"
                  id="budget_min"
                  placeholder="Min"
                  value={budgetMin !== undefined ? budgetMin.toString() : ''}
                  onChange={(e) => setBudgetMin(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-1/2"
                />
                <Input
                  type="number"
                  id="budget_max"
                  placeholder="Max"
                  value={budgetMax !== undefined ? budgetMax.toString() : ''}
                  onChange={(e) => setBudgetMax(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-1/2"
                />
                <Select 
                  value={currency} 
                  onValueChange={(value: string) => setCurrency(value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">
                Skills
              </Label>
              <Input
                type="text"
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="col-span-3"
                placeholder="e.g., React, Node.js, UI Design"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_priority" className="text-right">
                Priority
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="is_priority"
                  checked={isPriority}
                  onCheckedChange={(checked) => setIsPriority(checked)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Opportunity' : 'Create Opportunity'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDialog;
