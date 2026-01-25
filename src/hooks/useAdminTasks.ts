import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Fetch all tasks (for admin)
export function useAllTasks() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['admin_tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('xp_value', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: isAdmin,
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update an existing task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Get task completion stats
export function useTaskCompletionStats() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['task_completion_stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipient_tasks')
        .select('task_id, status');
      
      if (error) throw error;
      
      // Group by task and count completions
      const stats: Record<string, { total: number; completed: number; pending: number }> = {};
      
      data?.forEach(rt => {
        if (!stats[rt.task_id]) {
          stats[rt.task_id] = { total: 0, completed: 0, pending: 0 };
        }
        stats[rt.task_id].total++;
        if (rt.status === 'completed') {
          stats[rt.task_id].completed++;
        } else if (rt.status === 'pending_verification') {
          stats[rt.task_id].pending++;
        }
      });
      
      return stats;
    },
    enabled: isAdmin,
  });
}
