import type { Database } from '@/integrations/supabase/types';

export type DonationStatus = Database['public']['Enums']['donation_status'];

// Define allowed state transitions
export const ALLOWED_TRANSITIONS: Record<DonationStatus, DonationStatus[]> = {
  draft: ['media_submitted'],
  media_submitted: ['under_verification'],
  under_verification: ['verified', 'verification_rejected'],
  verification_rejected: ['media_submitted'], // Allows re-upload
  verified: ['matchable'],
  matchable: ['matched'],
  matched: ['logistics_pending'],
  logistics_pending: ['pickup_scheduled'],
  pickup_scheduled: ['in_transit'],
  in_transit: ['received_at_hub'],
  received_at_hub: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['impact_confirmed'],
  impact_confirmed: [], // Terminal state
};

// Status display information
export const STATUS_INFO: Record<DonationStatus, { label: string; color: string; description: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-muted text-muted-foreground',
    description: 'Device details entered, awaiting photos',
  },
  media_submitted: {
    label: 'Media Submitted',
    color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    description: 'Photos uploaded, awaiting verification',
  },
  under_verification: {
    label: 'Under Review',
    color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    description: 'Admin is reviewing device photos',
  },
  verification_rejected: {
    label: 'Needs Attention',
    color: 'bg-destructive/20 text-destructive',
    description: 'Photos rejected, please re-upload',
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-500/20 text-green-700 dark:text-green-400',
    description: 'Device verified, preparing for matching',
  },
  matchable: {
    label: 'Ready to Match',
    color: 'bg-primary/20 text-primary',
    description: 'Device ready to be matched with a dreamer',
  },
  matched: {
    label: 'Matched',
    color: 'bg-accent/20 text-accent-foreground',
    description: 'Matched with a recipient',
  },
  logistics_pending: {
    label: 'Logistics Pending',
    color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    description: 'Awaiting logistics arrangement',
  },
  pickup_scheduled: {
    label: 'Pickup Scheduled',
    color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400',
    description: 'Pickup or drop-off scheduled',
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
    description: 'Device is being transported',
  },
  received_at_hub: {
    label: 'At Hub',
    color: 'bg-violet-500/20 text-violet-700 dark:text-violet-400',
    description: 'Received at distribution hub',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-teal-500/20 text-teal-700 dark:text-teal-400',
    description: 'On the way to recipient',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-600/20 text-green-700 dark:text-green-400',
    description: 'Device delivered to recipient',
  },
  impact_confirmed: {
    label: 'Impact Confirmed',
    color: 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary',
    description: 'Recipient confirmed receipt, impact tracked',
  },
};

// Check if a transition is allowed
export function canTransition(from: DonationStatus, to: DonationStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// Get next possible states from current state
export function getNextStates(current: DonationStatus): DonationStatus[] {
  return ALLOWED_TRANSITIONS[current] || [];
}

// Check if device can be matched (only matchable devices)
export function isMatchable(status: DonationStatus): boolean {
  return status === 'matchable';
}

// Check if device is verified
export function isVerified(status: DonationStatus): boolean {
  return ['verified', 'matchable', 'matched', 'logistics_pending', 'pickup_scheduled', 
          'in_transit', 'received_at_hub', 'out_for_delivery', 'delivered', 'impact_confirmed'].includes(status);
}

// Check if media can be edited (only before verification)
export function canEditMedia(status: DonationStatus): boolean {
  return ['draft', 'verification_rejected'].includes(status);
}

// Check if verification is pending
export function isAwaitingVerification(status: DonationStatus): boolean {
  return ['media_submitted', 'under_verification'].includes(status);
}

// Get status badge color class
export function getStatusColor(status: DonationStatus): string {
  return STATUS_INFO[status]?.color || 'bg-muted text-muted-foreground';
}

// Get human-readable status label
export function getStatusLabel(status: DonationStatus): string {
  return STATUS_INFO[status]?.label || status;
}

// Get status description
export function getStatusDescription(status: DonationStatus): string {
  return STATUS_INFO[status]?.description || '';
}
