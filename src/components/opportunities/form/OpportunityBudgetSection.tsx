
import React from 'react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OpportunityBudgetSectionProps {
  budgetMin: number | undefined;
  setBudgetMin: (value: number | undefined) => void;
  budgetMax: number | undefined;
  setBudgetMax: (value: number | undefined) => void;
  currency: string;
  setCurrency: (value: string) => void;
}

const OpportunityBudgetSection: React.FC<OpportunityBudgetSectionProps> = ({
  budgetMin, setBudgetMin,
  budgetMax, setBudgetMax,
  currency, setCurrency
}) => {
  return (
    <FormField id="budget" label="Budget">
      <div className="flex items-center space-x-2">
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
    </FormField>
  );
};

export default OpportunityBudgetSection;
