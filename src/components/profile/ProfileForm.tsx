
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { UserProfile } from '@/types/opportunity';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ProfileBasicSection from './ProfileBasicSection';
import ProfileSkillsSection from './ProfileSkillsSection';
import ProfileRatesSection from './ProfileRatesSection';
import ProfileLinksSection from './ProfileLinksSection';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  display_name: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  hourly_rate: z.coerce.number().optional(),
  availability: z.string().optional(),
  years_experience: z.coerce.number().optional(),
  portfolio_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  github_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  timezone: z.string().optional(),
  skills: z.string().optional(), // Will be converted to array
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile | null;
  userId: string;
  userEmail: string | undefined;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  profile, 
  userId,
  userEmail,
  onProfileUpdate 
}) => {
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      display_name: profile?.display_name || '',
      headline: profile?.headline || '',
      bio: profile?.bio || '',
      hourly_rate: profile?.hourly_rate || undefined,
      availability: profile?.availability || '',
      years_experience: profile?.years_experience || undefined,
      portfolio_url: profile?.portfolio_url || '',
      linkedin_url: profile?.linkedin_url || '',
      github_url: profile?.github_url || '',
      timezone: profile?.timezone || '',
      skills: profile?.skills ? profile?.skills.join(', ') : '',
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      // Process skills into an array
      const skillsArray = data.skills
        ? data.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      const profileData = {
        full_name: data.full_name,
        display_name: data.display_name || null,
        headline: data.headline || null,
        bio: data.bio || null,
        hourly_rate: data.hourly_rate || null,
        availability: data.availability || null,
        years_experience: data.years_experience || null,
        portfolio_url: data.portfolio_url || null,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        timezone: data.timezone || null,
        skills: skillsArray,
      };

      let response;
      
      if (profile) {
        // Update existing profile
        response = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('id', userId);
      } else {
        // Create new profile
        response = await supabase
          .from('user_profiles')
          .insert({
            ...profileData,
            id: userId,
            email: userEmail || '',
          });
      }

      if (response.error) throw response.error;
      
      toast.success(profile ? 'Profile updated' : 'Profile created');
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (updatedProfile) {
        onProfileUpdate(updatedProfile as UserProfile);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile Information</CardTitle>
        <CardDescription>
          This information will be used when creating proposals and communicating with clients.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <ProfileBasicSection control={form.control} />
            <ProfileSkillsSection control={form.control} />
            <ProfileRatesSection control={form.control} />
            <ProfileLinksSection control={form.control} />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={saving} className="ml-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileForm;
