import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
type ApplicationReference = Database['public']['Tables']['application_references']['Row'];

export function useMyApplication() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my_application', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          references:application_references(*)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useAllApplications() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all_applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profile:profiles!applications_user_id_fkey(*),
          references:application_references(*)
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });
}

export function useApplication(applicationId?: string) {
  return useQuery({
    queryKey: ['application', applicationId],
    queryFn: async () => {
      if (!applicationId) return null;
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profile:profiles!applications_user_id_fkey(*),
          references:application_references(*)
        `)
        .eq('id', applicationId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!applicationId,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (application: Omit<ApplicationInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('applications')
        .insert({ ...application, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_application'] });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Application> & { id: string }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['application', data.id] });
      queryClient.invalidateQueries({ queryKey: ['all_applications'] });
      queryClient.invalidateQueries({ queryKey: ['my_application'] });
    },
  });
}

export function useCreateApplicationReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: Database['public']['Tables']['application_references']['Insert']) => {
      const { data, error } = await supabase
        .from('application_references')
        .insert(reference)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_application'] });
      queryClient.invalidateQueries({ queryKey: ['all_applications'] });
    },
  });
}
