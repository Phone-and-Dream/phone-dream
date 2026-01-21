import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';

const REJECTION_REASONS = [
  { value: 'blurry', label: 'Images are blurry or unclear' },
  { value: 'serial_not_visible', label: 'Cannot see serial number' },
  { value: 'screen_off', label: 'Screen not visible or powered off' },
  { value: 'damage_mismatch', label: 'Device appears more damaged than stated condition' },
  { value: 'missing_photos', label: 'Missing required photos' },
  { value: 'wrong_device', label: 'Photos do not match device description' },
  { value: 'other', label: 'Other (please specify)' },
];

interface RejectionReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  deviceType?: string;
}

export function RejectionReasonModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  deviceType,
}: RejectionReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    let finalReason = '';
    
    if (selectedReason === 'other') {
      finalReason = customReason;
    } else {
      const reasonObj = REJECTION_REASONS.find(r => r.value === selectedReason);
      finalReason = reasonObj?.label || selectedReason;
      if (customReason) {
        finalReason += `: ${customReason}`;
      }
    }

    if (finalReason.trim()) {
      onConfirm(finalReason);
    }
  };

  const isValid = selectedReason && (selectedReason !== 'other' || customReason.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reject Device Verification
          </DialogTitle>
          <DialogDescription>
            {deviceType ? `Rejecting verification for ${deviceType}. ` : ''}
            The donor will be notified and can re-upload photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECTION_REASONS.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">
              {selectedReason === 'other' ? 'Please specify *' : 'Additional details (optional)'}
            </Label>
            <Textarea
              id="details"
              placeholder={
                selectedReason === 'other'
                  ? 'Describe the issue with the device photos...'
                  : 'Add any additional notes for the donor...'
              }
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Confirm Rejection'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
