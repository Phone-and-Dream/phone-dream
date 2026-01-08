import { useState } from 'react';
import { Check, User } from 'lucide-react';
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
import { mockDreamRequests, getRankColor, type Donation } from '@/lib/mockData';

interface MatchDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onMatch: (donationId: string, recipientId: string, recipientName: string) => void;
}

export function MatchDeviceModal({ open, onOpenChange, donation, onMatch }: MatchDeviceModalProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  const handleMatch = () => {
    if (selectedRecipient && donation) {
      const recipient = mockDreamRequests.find(r => r.recipientId === selectedRecipient);
      if (recipient) {
        onMatch(donation.id, recipient.recipientId, recipient.recipientName);
        setSelectedRecipient(null);
        onOpenChange(false);
      }
    }
  };

  if (!donation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Device to Recipient</DialogTitle>
          <DialogDescription>
            Select a dreamer from the Dream Board to receive this {donation.deviceType}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Device to match:</p>
          <p className="font-semibold">{donation.deviceType}</p>
          <p className="text-sm text-muted-foreground">{donation.condition} • Donated by {donation.donorName}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Eligible Dreamers:</p>
          {mockDreamRequests.map((dreamer) => (
            <div
              key={dreamer.id}
              onClick={() => setSelectedRecipient(dreamer.recipientId)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedRecipient === dreamer.recipientId
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={dreamer.recipientAvatar} alt={dreamer.recipientName} />
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{dreamer.recipientName}</span>
                    <Badge variant="outline" className={getRankColor(dreamer.xpRank)}>
                      {dreamer.xpRank}
                    </Badge>
                    {selectedRecipient === dreamer.recipientId && (
                      <Check className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{dreamer.creatorType} • {dreamer.region}</p>
                  <p className="text-sm mt-1">Needs: <span className="font-medium">{dreamer.deviceNeeded}</span></p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{dreamer.purpose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

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
