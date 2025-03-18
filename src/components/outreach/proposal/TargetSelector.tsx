
import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';

interface TargetSelectorProps {
  businesses: Business[];
  opportunities: Opportunity[];
  selectedTarget: Business | Opportunity | null;
  onSelectTarget: (target: Business | Opportunity) => void;
  loading: boolean;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  businesses,
  opportunities,
  selectedTarget,
  onSelectTarget,
  loading
}) => {
  return (
    <div>
      <Label htmlFor="target-type">Target Type</Label>
      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business" className="space-y-4">
          <Select 
            disabled={loading || businesses.length === 0}
            onValueChange={(value) => {
              const selected = businesses.find(b => b.id === value);
              if (selected) onSelectTarget(selected);
            }}
            value={selectedTarget && 'name' in selectedTarget ? selectedTarget.id : ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map(business => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
        
        <TabsContent value="opportunity" className="space-y-4">
          <Select 
            disabled={loading || opportunities.length === 0}
            onValueChange={(value) => {
              const selected = opportunities.find(o => o.id === value);
              if (selected) onSelectTarget(selected);
            }}
            value={selectedTarget && 'title' in selectedTarget ? selectedTarget.id : ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an opportunity" />
            </SelectTrigger>
            <SelectContent>
              {opportunities.map(opportunity => (
                <SelectItem key={opportunity.id} value={opportunity.id}>
                  {opportunity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>
      </Tabs>
    </div>
  );
};
