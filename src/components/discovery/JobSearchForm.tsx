
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { BasicSearchFields, AdvancedFilters, SearchButton } from './job-search-form';

const formSchema = z.object({
  query: z.string().min(2, { message: 'Search term must be at least 2 characters' }),
  location: z.string().optional(),
  source: z.string().optional(),
  remote: z.boolean().optional(),
  experienceLevel: z.string().optional(),
  datePosted: z.string().optional(),
  minBudget: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobSearchFormProps {
  onSearch: (query: string, location: string, source: string, filters?: any) => void;
  isLoading?: boolean;
}

const JobSearchForm: React.FC<JobSearchFormProps> = ({ onSearch, isLoading = false }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      location: 'remote',
      source: 'all',
      remote: true,
      experienceLevel: 'any',
      datePosted: 'any',
      minBudget: 0,
    }
  });

  const handleSubmit = (data: FormData) => {
    if (isLoading) return;
    
    try {
      // Extract additional filters
      const filters = {
        experienceLevel: data.experienceLevel,
        datePosted: data.datePosted,
        minBudget: data.minBudget,
      };
      
      onSearch(
        data.query, 
        data.remote ? 'remote' : (data.location || ''), 
        data.source || 'all',
        filters
      );
    } catch (error) {
      console.error('Error in search form:', error);
      toast.error('Failed to submit search');
    }
  };

  return (
    <Card className="overflow-hidden">
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6">
            <BasicSearchFields />
            <AdvancedFilters />
            <SearchButton isLoading={isLoading} />
          </form>
        </Form>
      </FormProvider>
    </Card>
  );
};

export default JobSearchForm;
