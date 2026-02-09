import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DonorWaitlistData {
  full_name: string;
  email: string;
  country: string;
  donor_type: string;
  organization_name?: string;
  organization_role?: string;
  devices_interested: string[];
  donation_timing?: string;
  estimated_devices?: string;
  support_reason?: string;
}

export interface RecipientWaitlistData {
  full_name: string;
  email: string;
  country: string;
  state: string;
  age_range: string;
  current_status: string;
  current_status_other?: string;
  learning_interest: string;
  learning_interest_other?: string;
  device_usage_plan: string;
  device_needed: string[];
  current_device_status: string;
}

export function useSubmitDonorWaitlist() {
  return useMutation({
    mutationFn: async (data: DonorWaitlistData) => {
      const { error } = await supabase
        .from('donor_waitlist')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Welcome to the donor waitlist!', {
        description: "You'll be among the first to bring a dream to reality.",
      });
    },
    onError: (error: Error) => {
      console.error('Donor waitlist error:', error);
      toast.error('Failed to join waitlist', {
        description: 'Please try again later.',
      });
    },
  });
}

export function useSubmitRecipientWaitlist() {
  return useMutation({
    mutationFn: async (data: RecipientWaitlistData) => {
      const { error } = await supabase
        .from('recipient_waitlist')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Welcome to the recipient waitlist!', {
        description: 'This is the first step toward turning your dream into reality.',
      });
    },
    onError: (error: Error) => {
      console.error('Recipient waitlist error:', error);
      toast.error('Failed to join waitlist', {
        description: 'Please try again later.',
      });
    },
  });
}
