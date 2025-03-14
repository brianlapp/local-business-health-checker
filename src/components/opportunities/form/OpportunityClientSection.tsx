
import React from 'react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface OpportunityClientSectionProps {
  clientName: string;
  setClientName: (value: string) => void;
  clientWebsite: string;
  setClientWebsite: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  isRemote: boolean;
  setIsRemote: (value: boolean) => void;
}

const OpportunityClientSection: React.FC<OpportunityClientSectionProps> = ({
  clientName, setClientName,
  clientWebsite, setClientWebsite,
  location, setLocation,
  isRemote, setIsRemote
}) => {
  return (
    <>
      <FormField id="client_name" label="Client Name">
        <Input
          type="text"
          id="client_name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full"
        />
      </FormField>

      <FormField id="client_website" label="Client Website">
        <Input
          type="url"
          id="client_website"
          value={clientWebsite}
          onChange={(e) => setClientWebsite(e.target.value)}
          className="w-full"
        />
      </FormField>

      <FormField id="location" label="Location">
        <Input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full"
        />
      </FormField>
      
      <FormField id="is_remote" label="Remote">
        <div className="flex items-center">
          <Switch
            id="is_remote"
            checked={isRemote}
            onCheckedChange={(checked) => setIsRemote(checked)}
          />
        </div>
      </FormField>
    </>
  );
};

export default OpportunityClientSection;
