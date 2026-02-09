import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type RecipientProfile = Database['public']['Tables']['recipient_profiles']['Row'];
type DonorProfile = Database['public']['Tables']['donor_profiles']['Row'];

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMyProfile() {
  const { user } = useAuth();
  return useProfile(user?.id);
}

export function useRecipientProfile(userId?: string) {
  return useQuery({
    queryKey: ['recipient_profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('recipient_profiles')
        .select(`
          *,
          profile:profiles!recipient_profiles_user_id_fkey(*)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMyRecipientProfile() {
  const { user } = useAuth();
  return useRecipientProfile(user?.id);
}

export function useDonorProfile(userId?: string) {
  return useQuery({
    queryKey: ['donor_profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('donor_profiles')
        .select(`
          *,
          profile:profiles!donor_profiles_user_id_fkey(*)
        `)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useMyDonorProfile() {
  const { user } = useAuth();
  return useDonorProfile(user?.id);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUpdateRecipientProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<RecipientProfile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('recipient_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipient_profile', user?.id] });
    },
  });
}

export function useUpdateDonorProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<DonorProfile>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('donor_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor_profile', user?.id] });
    },
  });
}

// Leaderboard query - all recipients sorted by XP
export function useLeaderboard(filters?: { country?: string; creatorType?: string }) {
  return useQuery({
    queryKey: ['leaderboard', filters],
    queryFn: async () => {
      // First get recipient profiles
      let query = supabase
        .from('recipient_profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(100);

      const creatorTypes = ['student', 'artist', 'entrepreneur', 'developer', 'educator', 'other'];
      if (filters?.creatorType && filters.creatorType !== 'all' && creatorTypes.includes(filters.creatorType)) {
        query = query.eq('creator_type', filters.creatorType as any);
      }

      const { data: recipientProfiles, error } = await query;
      
      if (error) throw error;

      // Fetch profiles separately
      const userIds = recipientProfiles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Combine data
      const combined = recipientProfiles.map(r => ({
        ...r,
        profile: profiles?.find(p => p.id === r.user_id) || null
      }));

      // Filter by country if specified
      if (filters?.country && filters.country !== 'all') {
        return combined.filter(r => r.profile?.country === filters.country);
      }

      return combined;
    },
  });
}

// Public recipient profile for public profile page
export function usePublicRecipientProfile(userId?: string) {
  return useQuery({
    queryKey: ['public_recipient_profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get recipient profile
      const { data: recipientProfile, error } = await supabase
        .from('recipient_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!recipientProfile) return null;
      
      // Get base profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      return { ...recipientProfile, profile };
    },
    enabled: !!userId,
  });
}

// Public donor profile for public profile page
export function usePublicDonorProfile(userId?: string) {
  return useQuery({
    queryKey: ['public_donor_profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get donor profile
      const { data: donorProfile, error } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!donorProfile) return null;
      
      // Get base profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      return { ...donorProfile, profile };
    },
    enabled: !!userId,
  });
}
