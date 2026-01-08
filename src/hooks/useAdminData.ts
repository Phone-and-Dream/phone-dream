import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type XPRule = Database['public']['Tables']['xp_rules']['Row'];
type XPTransaction = Database['public']['Tables']['xp_transactions']['Insert'];
type Attestation = Database['public']['Tables']['attestations']['Row'];

// Fetch all recipient profiles with their base profile
export function useAllRecipientProfiles() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all_recipient_profiles'],
    queryFn: async () => {
      const { data: recipientProfiles, error: rpError } = await supabase
        .from('recipient_profiles')
        .select('*')
        .order('xp', { ascending: false });
      
      if (rpError) throw rpError;
      
      const userIds = recipientProfiles?.map(rp => rp.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      return recipientProfiles?.map(rp => ({
        ...rp,
        profile: profiles?.find(p => p.id === rp.user_id) || null,
      })) || [];
    },
    enabled: isAdmin,
  });
}

// Fetch all donor profiles with their base profile
export function useAllDonorProfiles() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['all_donor_profiles'],
    queryFn: async () => {
      const { data: donorProfiles, error: dpError } = await supabase
        .from('donor_profiles')
        .select('*')
        .order('total_donated', { ascending: false });
      
      if (dpError) throw dpError;
      
      const userIds = donorProfiles?.map(dp => dp.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      return donorProfiles?.map(dp => ({
        ...dp,
        profile: profiles?.find(p => p.id === dp.user_id) || null,
      })) || [];
    },
    enabled: isAdmin,
  });
}

// Fetch all attestations
export function useAttestations() {
  return useQuery({
    queryKey: ['attestations'],
    queryFn: async () => {
      const { data: attestations, error: attError } = await supabase
        .from('attestations')
        .select(`
          *,
          donation:donations(*)
        `)
        .order('created_at', { ascending: false });
      
      if (attError) throw attError;
      
      // Get unique profile IDs
      const donorIds = attestations?.map(a => a.donor_id) || [];
      const recipientIds = attestations?.map(a => a.recipient_id) || [];
      const allIds = [...new Set([...donorIds, ...recipientIds])];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allIds);
      
      if (profilesError) throw profilesError;
      
      return attestations?.map(att => ({
        ...att,
        donor: profiles?.find(p => p.id === att.donor_id) || null,
        recipient: profiles?.find(p => p.id === att.recipient_id) || null,
      })) || [];
    },
  });
}

// Fetch all XP rules
export function useXPRules() {
  return useQuery({
    queryKey: ['xp_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_rules')
        .select('*')
        .order('xp_value', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Update XP rule mutation
export function useUpdateXPRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<XPRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('xp_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xp_rules'] });
    },
  });
}

// Create XP transaction mutation (award/deduct XP)
export function useCreateXPTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: XPTransaction) => {
      const { data, error } = await supabase
        .from('xp_transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xp_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all_recipient_profiles'] });
    },
  });
}

// Fetch XP transactions
export function useXPTransactions() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ['xp_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select(`
          *,
          rule:xp_rules(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });
}

// Update application reference validation
export function useUpdateApplicationReference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_validated }: { id: string; is_validated: boolean }) => {
      const { data, error } = await supabase
        .from('application_references')
        .update({ 
          is_validated, 
          validated_at: is_validated ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_applications'] });
      queryClient.invalidateQueries({ queryKey: ['my_application'] });
    },
  });
}

// Fetch approved dream requests for matching
export function useApprovedDreamRequests() {
  return useQuery({
    queryKey: ['approved_dream_requests'],
    queryFn: async () => {
      const { data: dreamRequests, error: drError } = await supabase
        .from('dream_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: true });
      
      if (drError) throw drError;
      
      const recipientIds = dreamRequests?.map(dr => dr.recipient_id) || [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', recipientIds);
      
      if (profilesError) throw profilesError;
      
      const { data: recipientProfiles, error: rpError } = await supabase
        .from('recipient_profiles')
        .select('*')
        .in('user_id', recipientIds);
      
      if (rpError) throw rpError;
      
      return dreamRequests?.map(dr => ({
        ...dr,
        recipient: profiles?.find(p => p.id === dr.recipient_id) || null,
        recipient_profile: recipientProfiles?.find(rp => rp.user_id === dr.recipient_id) || null,
      })) || [];
    },
  });
}

// Fetch recent activity logs
export function useActivityLogs() {
  return useQuery({
    queryKey: ['activity_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });
}

// Create attestation via edge function
export function useCreateAttestation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      donation_id: string;
      donor_id: string;
      recipient_id: string;
      device_type: string;
      condition: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-attestation', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attestations'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations'] });
    },
  });
}
