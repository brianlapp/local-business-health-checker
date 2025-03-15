
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProfileFormValues } from './ProfileForm';

interface ProfileRatesSectionProps {
  control: Control<ProfileFormValues>;
}

const ProfileRatesSection: React.FC<ProfileRatesSectionProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="hourly_rate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hourly Rate ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g. 75" 
                {...field}
                value={field.value?.toString() || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="years_experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years Experience</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="e.g. 5" 
                {...field}
                value={field.value?.toString() || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Availability</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. Full-time, Part-time, 20hrs/week" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProfileRatesSection;
