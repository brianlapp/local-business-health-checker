
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  query: z.string().min(2, { message: 'Search term must be at least 2 characters' }),
  location: z.string().optional(),
  source: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface JobSearchFormProps {
  onSearch: (query: string, location: string, source: string) => void;
  isLoading?: boolean;
}

const JobSearchForm: React.FC<JobSearchFormProps> = ({ onSearch, isLoading = false }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
      location: 'remote',
      source: 'all'
    }
  });

  const handleSubmit = (data: FormData) => {
    if (isLoading) return;
    
    try {
      onSearch(
        data.query, 
        data.location || 'remote', 
        data.source || 'all'
      );
    } catch (error) {
      console.error('Error in search form:', error);
      toast.error('Failed to submit search');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-card p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Search Term</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. React Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Remote, New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Job Board</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job board" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="upwork">Upwork</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>Searching...</>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default JobSearchForm;
