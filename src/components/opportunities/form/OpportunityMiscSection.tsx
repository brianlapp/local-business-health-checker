
import React from 'react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface OpportunityMiscSectionProps {
  skills: string;
  setSkills: (value: string) => void;
  isPriority: boolean;
  setIsPriority: (value: boolean) => void;
}

const OpportunityMiscSection: React.FC<OpportunityMiscSectionProps> = ({
  skills, setSkills,
  isPriority, setIsPriority
}) => {
  return (
    <>
      <FormField id="skills" label="Skills">
        <Input
          type="text"
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full"
          placeholder="e.g., React, Node.js, UI Design"
        />
      </FormField>
      
      <FormField id="is_priority" label="Priority">
        <div className="flex items-center">
          <Switch
            id="is_priority"
            checked={isPriority}
            onCheckedChange={(checked) => setIsPriority(checked)}
          />
        </div>
      </FormField>
    </>
  );
};

export default OpportunityMiscSection;
