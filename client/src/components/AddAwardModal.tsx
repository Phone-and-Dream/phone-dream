import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAward } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';

interface AddAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAwardModal({ isOpen, onClose }: AddAwardModalProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const createAward = useCreateAward();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please enter the award title", variant: "destructive" });
      return;
    }

    try {
      await createAward.mutateAsync({
        title,
        issuer: issuer || null,
        date_received: dateReceived || null,
        description: description || null,
        url: url || null,
      });
      toast({ title: "Award added!", description: "Your award has been added to your profile." });
      resetForm();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add award", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setTitle('');
    setIssuer('');
    setDateReceived('');
    setDescription('');
    setUrl('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Award</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Award Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Best Innovation Award"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Issuing Organization</Label>
            <Input
              id="issuer"
              placeholder="e.g., Tech Conference 2024"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-received">Date Received</Label>
            <Input
              id="date-received"
              type="date"
              value={dateReceived}
              onChange={(e) => setDateReceived(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the award and what it was for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Link/Certificate URL (optional)</Label>
            <Input
              id="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={createAward.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={createAward.isPending}>
              {createAward.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Award
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
