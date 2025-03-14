
import React from 'react';
import FormField from './FormField';
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

interface OpportunityBasicSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  sourceUrl: string;
  setSourceUrl: (value: string) => void;
  status: Opportunity['status'];
  setStatus: (value: Opportunity['status']) => void;
}

const OpportunityBasicSection: React.FC<OpportunityBasicSectionProps> = ({
  title, setTitle,
  description, setDescription,
  source, setSource,
  sourceUrl, setSourceUrl,
  status, setStatus
}) => {
  return (
    <>
      <FormField id="title" label="Title">
        <Input 
          type="text" 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full" 
          required
        />
      </FormField>

      <FormField id="description" label="Description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </FormField>

      <FormField id="source" label="Source">
        <Select 
          value={source} 
          onValueChange={(value: string) => setSource(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="job_board">Job Board</SelectItem>
            <SelectItem value="recruiting_agency">Recruiting Agency</SelectItem>
            <SelectItem value="direct_client">Direct Client</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField id="source_url" label="Source URL">
        <Input
          type="url"
          id="source_url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full"
        />
      </FormField>

      <FormField id="status" label="Status">
        <Select 
          value={status} 
          onValueChange={(value: Opportunity['status']) => setStatus(value)}
        >
          <SelectTrigger className="w-full">
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
      </FormField>
    </>
  );
};

export default OpportunityBasicSection;
