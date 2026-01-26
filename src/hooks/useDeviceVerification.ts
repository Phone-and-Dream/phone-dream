import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/lib/auditLog';
import type { Database } from '@/integrations/supabase/types';

type DonationStatus = Database['public']['Enums']['donation_status'];

interface DonationWithDetails {
  id: string;
  device_type: string;
  device_specs: string | null;
  condition: string;
  status: DonationStatus;
  media_front_url: string | null;
  media_back_url: string | null;
  media_screen_url: string | null;
  media_serial_url: string | null;
  media_video_url: string | null;
  verification_notes: string | null;
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  donor: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

// Fetch donations pending verification
export function usePendingVerifications() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['pending_verifications'],
    queryFn: async () => {
      // Get donations that need verification
      const { data: donations, error } = await supabase
        .from('donations')
        .select('*')
        .in('status', ['media_submitted', 'under_verification'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get donor profiles
      const donorIds = donations?.map(d => d.donor_id).filter(Boolean) || [];
      if (donorIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', donorIds);

      return donations?.map(donation => ({
        ...donation,
        donor: profiles?.find(p => p.id === donation.donor_id) || null,
      })) as DonationWithDetails[];
    },
    enabled: isAdmin,
  });
}

// Fetch all donations with verification info for admin
export function useAllDonationsForVerification() {
  const { isAdmin } = useAuth();

  return useQuery({
    queryKey: ['all_donations_verification'],
    queryFn: async () => {
      const { data: donations, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const donorIds = donations?.map(d => d.donor_id).filter(Boolean) || [];
      if (donorIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', donorIds);

      return donations?.map(donation => ({
        ...donation,
        donor: profiles?.find(p => p.id === donation.donor_id) || null,
      })) as DonationWithDetails[];
    },
    enabled: isAdmin,
  });
}

// Approve device verification
export function useApproveDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      donationId, 
      notes 
    }: { 
      donationId: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('donations')
        .update({
          status: 'verified' as DonationStatus,
          verification_notes: notes || null,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAdminAction({
        actionType: 'verify_device',
        description: `Approved device verification for donation`,
        entityType: 'donation',
        entityId: donationId,
        newValue: { status: 'verified', notes },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_verifications'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations_verification'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations'] });
    },
  });
}

// Reject device verification
export function useRejectDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      donationId, 
      reason 
    }: { 
      donationId: string; 
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('donations')
        .update({
          status: 'verification_rejected' as DonationStatus,
          rejection_reason: reason,
          verified_at: null,
        })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAdminAction({
        actionType: 'reject_device',
        description: `Rejected device verification: ${reason}`,
        entityType: 'donation',
        entityId: donationId,
        newValue: { status: 'verification_rejected', reason },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_verifications'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations_verification'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations'] });
    },
  });
}

// Move verified device to matchable
export function useMakeMatchable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) => {
      const { data, error } = await supabase
        .from('donations')
        .update({ status: 'matchable' as DonationStatus })
        .eq('id', donationId)
        .eq('status', 'verified')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_donations_verification'] });
      queryClient.invalidateQueries({ queryKey: ['all_donations'] });
    },
  });
}

// Submit media for verification (donor action)
export function useSubmitForVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) => {
      const { data, error } = await supabase
        .from('donations')
        .update({ status: 'media_submitted' as DonationStatus })
        .eq('id', donationId)
        .in('status', ['draft', 'verification_rejected'])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error('Unable to submit - donation may have already been submitted or is in an invalid state.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_donations'] });
      queryClient.invalidateQueries({ queryKey: ['pending_verifications'] });
    },
  });
}
