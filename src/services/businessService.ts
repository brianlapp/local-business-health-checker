
import { supabase } from '@/lib/supabase';
import { Business } from '@/types/business';
import { toast } from 'sonner';

export async function getBusinesses(): Promise<Business[]> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) throw error;
    
    return data.map(business => ({
      id: business.id,
      name: business.name,
      website: business.website,
      score: business.score || 0,
      cms: business.cms || undefined,
      speedScore: business.speed_score || undefined,
      lastChecked: business.last_checked || undefined,
      issues: generateIssues(business),
    }));
  } catch (error) {
    console.error('Error fetching businesses:', error);
    toast.error('Failed to load businesses');
    return [];
  }
}

export async function addBusiness(business: Omit<Business, 'id' | 'issues'>): Promise<Business | null> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name: business.name,
        website: business.website,
        score: business.score,
        cms: business.cms,
        speed_score: business.speedScore,
        last_checked: business.lastChecked,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Business added successfully');
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      score: data.score || 0,
      cms: data.cms || undefined,
      speedScore: data.speed_score || undefined,
      lastChecked: data.last_checked || undefined,
      issues: generateIssues(data),
    };
  } catch (error) {
    console.error('Error adding business:', error);
    toast.error('Failed to add business');
    return null;
  }
}

export async function updateBusiness(id: string, updates: Partial<Omit<Business, 'id' | 'issues'>>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({
        name: updates.name,
        website: updates.website,
        score: updates.score,
        cms: updates.cms,
        speed_score: updates.speedScore,
        last_checked: updates.lastChecked,
      })
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Business updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating business:', error);
    toast.error('Failed to update business');
    return false;
  }
}

function generateIssues(business: any) {
  return {
    speedIssues: (business.speed_score || 0) < 50,
    outdatedCMS: isCMSOutdated(business.cms),
    noSSL: !isWebsiteSecure(business.website),
    notMobileFriendly: Math.random() > 0.5, // Example placeholder
    badFonts: Math.random() > 0.7, // Example placeholder
  };
}

function isCMSOutdated(cms: string | null | undefined): boolean {
  if (!cms) return false;
  
  const outdatedCMSList = [
    'WordPress 5.4', 'WordPress 5.5', 'WordPress 5.6',
    'Joomla 3.8', 'Joomla 3.9',
    'Drupal 7', 'Drupal 8'
  ];
  
  return outdatedCMSList.some(outdatedCMS => cms.includes(outdatedCMS));
}

function isWebsiteSecure(website: string): boolean {
  return website.startsWith('https://') || !website.startsWith('http://');
}
