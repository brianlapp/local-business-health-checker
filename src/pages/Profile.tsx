
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/types/opportunity';

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

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      display_name: '',
      headline: '',
      bio: '',
      hourly_rate: undefined,
      availability: '',
      years_experience: undefined,
      portfolio_url: '',
      linkedin_url: '',
      github_url: '',
      timezone: '',
      skills: '',
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setProfile(data as UserProfile);
          
          // Update form with profile data
          form.reset({
            full_name: data.full_name || '',
            display_name: data.display_name || '',
            headline: data.headline || '',
            bio: data.bio || '',
            hourly_rate: data.hourly_rate || undefined,
            availability: data.availability || '',
            years_experience: data.years_experience || undefined,
            portfolio_url: data.portfolio_url || '',
            linkedin_url: data.linkedin_url || '',
            github_url: data.github_url || '',
            timezone: data.timezone || '',
            skills: data.skills ? data.skills.join(', ') : '',
          });
        }
      } catch (error: any) {
        toast.error(`Error loading profile: ${error.message}`);
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
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
          .eq('id', user.id);
      } else {
        // Create new profile
        response = await supabase
          .from('user_profiles')
          .insert({
            ...profileData,
            id: user.id,
            email: user.email || '',
          });
      }

      if (response.error) throw response.error;
      
      toast.success(profile ? 'Profile updated' : 'Profile created');
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (updatedProfile) {
        setProfile(updatedProfile as UserProfile);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Professional Profile</h1>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="How you want to be addressed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Headline</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Senior Web Developer with 5+ years experience" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of your background and expertise" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="portfolio_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. UTC-5, EST" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
      )}
    </div>
  );
};

export default Profile;
