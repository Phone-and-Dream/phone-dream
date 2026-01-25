import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type RecipientTask = Database['public']['Tables']['recipient_tasks']['Row'];

export interface TaskWithProgress extends Task {
  recipientTask?: RecipientTask;
}

// Fetch all active tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('xp_value', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
  });
}

// Fetch recipient's task progress
export function useMyRecipientTasks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recipient_tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('recipient_tasks')
        .select('*')
        .eq('recipient_id', user.id);
      
      if (error) throw error;
      return data as RecipientTask[];
    },
    enabled: !!user?.id,
  });
}

// Combined hook: tasks with user's progress
export function useTasksWithProgress() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: recipientTasks = [], isLoading: recipientTasksLoading } = useMyRecipientTasks();
  
  const tasksWithProgress: TaskWithProgress[] = tasks.map(task => {
    const recipientTask = recipientTasks.find(rt => rt.task_id === task.id);
    return { ...task, recipientTask };
  });
  
  return {
    data: tasksWithProgress,
    isLoading: tasksLoading || recipientTasksLoading,
  };
}

// Start a task
export function useStartTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('recipient_tasks')
        .insert({
          recipient_id: user.id,
          task_id: taskId,
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient_tasks', user?.id] });
    },
  });
}

// Submit a task for verification
export function useSubmitTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, submissionData }: { taskId: string; submissionData?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('recipient_tasks')
        .update({
          status: 'pending_verification',
          submission_data: submissionData,
          submitted_at: new Date().toISOString(),
        })
        .eq('recipient_id', user.id)
        .eq('task_id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient_tasks', user?.id] });
    },
  });
}

// Complete a task (auto-verification)
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ taskId, xpAwarded }: { taskId: string; xpAwarded: number }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('recipient_tasks')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('task_id', taskId)
        .single();

      if (existingTask) {
        // Update existing task
        const { data, error } = await supabase
          .from('recipient_tasks')
          .update({
            status: 'completed',
            submitted_at: new Date().toISOString(),
            verified_at: new Date().toISOString(),
            xp_awarded: xpAwarded,
          })
          .eq('recipient_id', user.id)
          .eq('task_id', taskId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new completed task
        const { data, error } = await supabase
          .from('recipient_tasks')
          .insert({
            recipient_id: user.id,
            task_id: taskId,
            status: 'completed',
            submitted_at: new Date().toISOString(),
            verified_at: new Date().toISOString(),
            xp_awarded: xpAwarded,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient_tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recipient_profile'] });
    },
  });
}

// Calculate total XP from completed tasks
export function useCalculatedXP() {
  const { data: recipientTasks = [] } = useMyRecipientTasks();
  
  const totalXP = recipientTasks
    .filter(rt => rt.status === 'completed')
    .reduce((sum, rt) => sum + (rt.xp_awarded || 0), 0);
  
  return totalXP;
}

// Check if user can apply for device (100 XP threshold) - with realtime updates
export function useCanApplyForDevice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: recipientProfile } = useQuery({
    queryKey: ['recipient_profile_xp', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('recipient_profiles')
        .select('xp')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set up realtime subscription for XP updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('xp-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipient_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate the query to refetch XP
          queryClient.invalidateQueries({ queryKey: ['recipient_profile_xp', user.id] });
          queryClient.invalidateQueries({ queryKey: ['recipient_profile', user.id] });
          queryClient.invalidateQueries({ queryKey: ['my_recipient_profile'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  const totalXP = recipientProfile?.xp || 0;
  
  return {
    canApply: totalXP >= 100,
    currentXP: totalXP,
    requiredXP: 100,
    progress: Math.min((totalXP / 100) * 100, 100),
  };
}
