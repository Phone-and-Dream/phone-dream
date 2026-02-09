import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type DreamRequest = Database['public']['Tables']['dream_requests']['Row'];
type DreamRequestInsert = Database['public']['Tables']['dream_requests']['Insert'];

export function useDreamRequests(filters?: { deviceType?: string; status?: string }) {
  return useQuery({
    queryKey: ['dream_requests', filters],
    queryFn: async () => {
      let query = supabase
        .from('dream_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all' && 
          ['open', 'matched', 'fulfilled'].includes(filters.status)) {
        query = query.eq('status', filters.status as 'open' | 'matched' | 'fulfilled');
      }

      const { data: dreamRequests, error } = await query;
      
      if (error) throw error;
      
      // Get recipient profiles
      const recipientIds = dreamRequests?.map(dr => dr.recipient_id) || [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', recipientIds);
      
      const { data: recipientProfiles } = await supabase
        .from('recipient_profiles')
        .select('*')
        .in('user_id', recipientIds);

      let results = dreamRequests?.map(dr => ({
        ...dr,
        recipient: profiles?.find(p => p.id === dr.recipient_id) || null,
        recipient_profile: recipientProfiles?.find(rp => rp.user_id === dr.recipient_id) || null,
      })) || [];

      // Filter by device type if specified
      if (filters?.deviceType && filters.deviceType !== 'all') {
        results = results.filter(r => 
          r.device_needed.toLowerCase().includes(filters.deviceType!.toLowerCase())
        );
      }

      return results;
    },
  });
}

// Fetch open dream requests for public Dream Board
export function useOpenDreamRequests() {
  return useQuery({
    queryKey: ['open_dream_requests'],
    queryFn: async () => {
      const { data: dreamRequests, error } = await supabase
        .from('dream_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const recipientIds = dreamRequests?.map(dr => dr.recipient_id) || [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', recipientIds);
      
      const { data: recipientProfiles } = await supabase
        .from('recipient_profiles')
        .select('*')
        .in('user_id', recipientIds);

      return dreamRequests?.map(dr => ({
        ...dr,
        recipient: profiles?.find(p => p.id === dr.recipient_id) || null,
        recipient_profile: recipientProfiles?.find(rp => rp.user_id === dr.recipient_id) || null,
      })) || [];
    },
  });
}

export function useMyDreamRequests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my_dream_requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('dream_requests')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCreateDreamRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: Omit<DreamRequestInsert, 'recipient_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('dream_requests')
        .insert({ ...request, recipient_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream_requests'] });
      queryClient.invalidateQueries({ queryKey: ['my_dream_requests'] });
    },
  });
}

export function useUpdateDreamRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DreamRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('dream_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream_requests'] });
      queryClient.invalidateQueries({ queryKey: ['my_dream_requests'] });
    },
  });
}

export function useDeleteDreamRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dream_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dream_requests'] });
      queryClient.invalidateQueries({ queryKey: ['my_dream_requests'] });
    },
  });
}
