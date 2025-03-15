
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

interface ProfileSkillsSectionProps {
  control: Control<ProfileFormValues>;
}

const ProfileSkillsSection: React.FC<ProfileSkillsSectionProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="skills"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Skills (comma separated)</FormLabel>
          <FormControl>
            <Input 
              placeholder="React, TypeScript, UI Design, etc." 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProfileSkillsSection;
