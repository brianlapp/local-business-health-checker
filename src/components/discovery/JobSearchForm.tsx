
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Search, Briefcase } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  query: z.string().min(2, { message: 'Search term must be at least 2 characters' }),
  location: z.string().optional(),
  source: z.string().optional(),
  remote: z.boolean().optional()
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
      source: 'all',
      remote: true
    }
  });

  const handleSubmit = (data: FormData) => {
    if (isLoading) return;
    
    try {
      onSearch(
        data.query, 
        data.remote ? 'remote' : (data.location || ''), 
        data.source || 'all'
      );
    } catch (error) {
      console.error('Error in search form:', error);
      toast.error('Failed to submit search');
    }
  };

  return (
    <Card className="overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you looking for?</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="e.g. React Developer, WordPress, UI Design" 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="remote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Remote Only</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Only show remote opportunities
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. New York, London, Global" 
                        {...field} 
                        disabled={form.watch('remote')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job source" />
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
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>Searching...</>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Find Opportunities
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default JobSearchForm;
