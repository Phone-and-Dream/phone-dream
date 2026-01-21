import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MediaCarousel } from '@/components/ui/media-carousel';
import { RejectionReasonModal } from './RejectionReasonModal';
import { useApproveDevice, useRejectDevice } from '@/hooks/useDeviceVerification';
import { getStatusLabel, getStatusColor } from '@/lib/donationStateMachine';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  X, 
  Loader2, 
  Laptop, 
  Smartphone, 
  Tablet,
  Monitor,
  HardDrive,
  Calendar,
  User,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
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
    location?: string | null;
  } | null;
}

interface DeviceVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: DonationWithDetails | null;
}

const getDeviceIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('laptop')) return Laptop;
  if (lowerType.includes('phone') || lowerType.includes('smart')) return Smartphone;
  if (lowerType.includes('tablet')) return Tablet;
  if (lowerType.includes('monitor')) return Monitor;
  return HardDrive;
};

export function DeviceVerificationModal({
  open,
  onOpenChange,
  donation,
}: DeviceVerificationModalProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const approveDevice = useApproveDevice();
  const rejectDevice = useRejectDevice();

  if (!donation) return null;

  const DeviceIcon = getDeviceIcon(donation.device_type);

  const mediaItems = [
    { url: donation.media_front_url || '', type: 'image' as const, label: 'Front View' },
    { url: donation.media_back_url || '', type: 'image' as const, label: 'Back View' },
    { url: donation.media_screen_url || '', type: 'image' as const, label: 'Screen (Powered On)' },
    { url: donation.media_serial_url || '', type: 'image' as const, label: 'Serial/IMEI Number' },
    { url: donation.media_video_url || '', type: 'video' as const, label: 'Device Video' },
  ].filter(item => item.url);

  const handleApprove = async () => {
    try {
      await approveDevice.mutateAsync({ donationId: donation.id, notes });
      toast({
        title: 'Device approved',
        description: 'The device has been verified and is ready for matching.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectDevice.mutateAsync({ donationId: donation.id, reason });
      toast({
        title: 'Device rejected',
        description: 'The donor has been notified to re-upload photos.',
      });
      setShowRejectModal(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Rejection failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const isVerificationPending = ['media_submitted', 'under_verification'].includes(donation.status);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DeviceIcon className="h-5 w-5" />
              Device Verification
            </DialogTitle>
            <DialogDescription>
              Review device photos and approve or reject the verification.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Media section - 3 columns */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Device Media ({mediaItems.length} items)
              </h3>
              {mediaItems.length > 0 ? (
                <MediaCarousel items={mediaItems} />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No media uploaded</p>
                </div>
              )}
            </div>

            {/* Info panel - 2 columns */}
            <div className="md:col-span-2 space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Status
                </h3>
                <Badge className={getStatusColor(donation.status)}>
                  {getStatusLabel(donation.status)}
                </Badge>
              </div>

              {/* Device info */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Device Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{donation.device_type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Condition: <span className="capitalize">{donation.condition}</span>
                  </p>
                  {donation.device_specs && (
                    <p className="text-sm text-muted-foreground">
                      {donation.device_specs}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Donor info */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Donor
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={donation.donor?.avatar_url || undefined} />
                    <AvatarFallback>
                      {donation.donor?.full_name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {donation.donor?.full_name || 'Anonymous Donor'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {donation.donor?.email}
                    </p>
                  </div>
                </div>
                {donation.donor?.location && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {donation.donor.location}
                  </div>
                )}
              </div>

              {/* Submission date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Submitted {format(new Date(donation.created_at), 'PPP')}
              </div>

              {/* Previous rejection reason */}
              {donation.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium text-destructive">
                    Previously Rejected
                  </p>
                  <p className="text-sm text-destructive/80 mt-1">
                    {donation.rejection_reason}
                  </p>
                </div>
              )}

              {/* Verification notes */}
              {isVerificationPending && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Verification Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this verification..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {isVerificationPending && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={approveDevice.isPending || rejectDevice.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveDevice.isPending || rejectDevice.isPending}
              >
                {approveDevice.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Device
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RejectionReasonModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={handleReject}
        isLoading={rejectDevice.isPending}
        deviceType={donation.device_type}
      />
    </>
  );
}
