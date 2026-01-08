import { useState } from 'react';
import { Check, User, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useApprovedDreamRequests } from '@/hooks/useAdminData';
import type { Database } from '@/integrations/supabase/types';

type Donation = Database['public']['Tables']['donations']['Row'] & {
  donor?: Database['public']['Tables']['profiles']['Row'] | null;
  recipient?: Database['public']['Tables']['profiles']['Row'] | null;
};

interface MatchDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onMatch: (donationId: string, recipientId: string, recipientName: string) => void;
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'Platinum':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'Gold':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Silver':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-orange-100 text-orange-700 border-orange-300';
  }
};

export function MatchDeviceModal({ open, onOpenChange, donation, onMatch }: MatchDeviceModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const { data: dreamRequests = [], isLoading } = useApprovedDreamRequests();

  const handleMatch = () => {
    if (selectedRecipient && donation) {
      const dreamer = dreamRequests.find(r => r.recipient_id === selectedRecipient);
      if (dreamer) {
        const recipientName = dreamer.recipient?.full_name || 'Unknown';
        onMatch(donation.id, dreamer.recipient_id, recipientName);
        setSelectedRecipient(null);
        onOpenChange(false);
      }
    }
  };

  if (!donation) return null;

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New';
      case 'refurbished':
        return 'Refurbished';
      case 'used':
        return 'Used';
      default:
        return condition;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Device to Recipient</DialogTitle>
          <DialogDescription>
            Select a dreamer from the Dream Board to receive this {donation.device_type}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Device to match:</p>
          <p className="font-semibold">{donation.device_type}</p>
          <p className="text-sm text-muted-foreground">
            {getConditionLabel(donation.condition)} • Donated by {donation.donor?.full_name || 'Unknown'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : dreamRequests.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Eligible Dreamers:</p>
            {dreamRequests.map((dreamer) => (
              <div
                key={dreamer.id}
                onClick={() => setSelectedRecipient(dreamer.recipient_id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedRecipient === dreamer.recipient_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={dreamer.recipient?.avatar_url || ''} alt={dreamer.recipient?.full_name || 'User'} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{dreamer.recipient?.full_name || 'Unknown'}</span>
                      <Badge variant="outline" className={getRankColor(dreamer.recipient_profile?.rank || 'Bronze')}>
                        {dreamer.recipient_profile?.rank || 'Bronze'}
                      </Badge>
                      {selectedRecipient === dreamer.recipient_id && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dreamer.recipient_profile?.creator_type || 'Other'} • {dreamer.recipient?.location || 'Unknown location'}
                    </p>
                    <p className="text-sm mt-1">Needs: <span className="font-medium">{dreamer.device_needed}</span></p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{dreamer.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No open dream requests found</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleMatch} disabled={!selectedRecipient}>
            <Check className="h-4 w-4 mr-2" />
            Confirm Match
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
