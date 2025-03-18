
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface FollowUpTask {
  id: string;
  due_date: string;
  completed: boolean;
  note: string;
  business_id?: string;
  opportunity_id?: string;
  agency_id?: string;
  related_message_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a follow-up task
 */
export async function createFollowUpTask(
  due_date: Date,
  note: string,
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string,
  related_message_id?: string
): Promise<FollowUpTask | null> {
  try {
    // In a real implementation, this should be stored in a dedicated follow_up_tasks table
    // For now, we'll use the outreach_messages table with a special message_type
    const task = {
      id: uuidv4(),
      [entityType === 'business' ? 'business_id' : 
       entityType === 'opportunity' ? 'opportunity_id' : 'agency_id']: entityId,
      message_type: 'follow_up',
      content: note,
      subject: 'Follow Up',
      scheduled_for: due_date.toISOString(),
      status: 'scheduled',
      // Store the related message ID in a custom field
      template_id: related_message_id // Using template_id to store the related message ID for now
    };
    
    const { data, error } = await supabase
      .from('outreach_messages')
      .insert(task)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating follow-up task:', error);
      toast.error('Failed to create follow-up task');
      return null;
    }
    
    // Transform to expected interface
    const followUpTask: FollowUpTask = {
      id: data.id,
      due_date: data.scheduled_for,
      completed: data.status === 'completed',
      note: data.content,
      [entityType + '_id']: data[entityType + '_id'],
      related_message_id: data.template_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    toast.success('Follow-up task created');
    return followUpTask;
  } catch (error) {
    console.error('Error in createFollowUpTask:', error);
    toast.error('An unexpected error occurred');
    return null;
  }
}

/**
 * Mark a follow-up task as completed
 */
export async function completeFollowUpTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('outreach_messages')
      .update({
        status: 'completed'
      })
      .eq('id', taskId)
      .eq('message_type', 'follow_up');
    
    if (error) {
      console.error('Error completing follow-up task:', error);
      toast.error('Failed to complete follow-up task');
      return false;
    }
    
    toast.success('Follow-up task completed');
    return true;
  } catch (error) {
    console.error('Error in completeFollowUpTask:', error);
    toast.error('An unexpected error occurred');
    return false;
  }
}

/**
 * Get follow-up tasks for a specific entity
 */
export async function getFollowUpTasks(
  entityType: 'business' | 'opportunity' | 'agency',
  entityId: string
): Promise<FollowUpTask[]> {
  try {
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq(entityType === 'business' ? 'business_id' : 
         entityType === 'opportunity' ? 'opportunity_id' : 'agency_id', entityId)
      .eq('message_type', 'follow_up')
      .order('scheduled_for', { ascending: true });
    
    if (error) {
      console.error('Error fetching follow-up tasks:', error);
      toast.error('Failed to load follow-up tasks');
      return [];
    }
    
    // Transform to expected interface
    const followUpTasks: FollowUpTask[] = (data || []).map(task => ({
      id: task.id,
      due_date: task.scheduled_for,
      completed: task.status === 'completed',
      note: task.content,
      [entityType + '_id']: task[entityType + '_id'],
      related_message_id: task.template_id,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));
    
    return followUpTasks;
  } catch (error) {
    console.error('Error in getFollowUpTasks:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}

/**
 * Get all upcoming follow-up tasks
 */
export async function getUpcomingFollowUpTasks(days: number = 7): Promise<FollowUpTask[]> {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('message_type', 'follow_up')
      .eq('status', 'scheduled')
      .lt('scheduled_for', endDate.toISOString())
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });
    
    if (error) {
      console.error('Error fetching upcoming follow-up tasks:', error);
      toast.error('Failed to load upcoming follow-up tasks');
      return [];
    }
    
    // Transform to expected interface
    const followUpTasks: FollowUpTask[] = (data || []).map(task => {
      // Determine entity type
      let entityType = 'business';
      if (task.opportunity_id) entityType = 'opportunity';
      if (task.agency_id) entityType = 'agency';
      
      return {
        id: task.id,
        due_date: task.scheduled_for,
        completed: task.status === 'completed',
        note: task.content,
        [entityType + '_id']: task[entityType + '_id'],
        related_message_id: task.template_id,
        created_at: task.created_at,
        updated_at: task.updated_at
      };
    });
    
    return followUpTasks;
  } catch (error) {
    console.error('Error in getUpcomingFollowUpTasks:', error);
    toast.error('An unexpected error occurred');
    return [];
  }
}
