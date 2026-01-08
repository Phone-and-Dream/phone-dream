import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Donation = Database['public']['Tables']['donations']['Row'];
type DonationInsert = Database['public']['Tables']['donations']['Insert'];

export function useDonation(donationId?: string) {
  return useQuery({
    queryKey: ['donation', donationId],
    queryFn: async () => {
      if (!donationId) return null;
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:profiles!donations_donor_id_fkey(*),
          recipient:profiles!donations_matched_recipient_id_fkey(*),
          attestation:attestations(*)
        `)
        .eq('id', donationId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!donationId,
  });
}

export function useMyDonations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my_donations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          recipient:profiles!donations_matched_recipient_id_fkey(*),
          attestation:attestations(*)
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useReceivedDonations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['received_donations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:profiles!donations_donor_id_fkey(*),
          attestation:attestations(*)
        `)
        .eq('matched_recipient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useAllDonations() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all_donations'],
    queryFn: async () => {
      // First get donations with attestations
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select(`
          *,
          attestation:attestations(*)
        `)
        .order('created_at', { ascending: false });
      
      if (donationsError) throw donationsError;
      
      // Get unique profile IDs
      const donorIds = donations?.map(d => d.donor_id).filter(Boolean) || [];
      const recipientIds = donations?.map(d => d.matched_recipient_id).filter(Boolean) || [];
      const allIds = [...new Set([...donorIds, ...recipientIds])];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allIds);
      
      if (profilesError) throw profilesError;
      
      // Combine the data
      return donations?.map(donation => ({
        ...donation,
        donor: profiles?.find(p => p.id === donation.donor_id) || null,
        recipient: profiles?.find(p => p.id === donation.matched_recipient_id) || null,
      })) || [];
    },
    enabled: isAdmin,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (donation: Omit<DonationInsert, 'donor_id'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('donations')
        .insert({ ...donation, donor_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_donations'] });
    },
  });
}

export function useUpdateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Donation> & { id: string }) => {
      const { data, error } = await supabase
        .from('donations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['donation', data.id] });
      queryClient.invalidateQueries({ queryKey: ['all_donations'] });
      queryClient.invalidateQueries({ queryKey: ['my_donations'] });
    },
  });
}
