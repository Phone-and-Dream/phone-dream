import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateAward, useDeleteAward } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';

interface Award {
  id: string;
  title: string;
  issuer: string | null;
  date_received: string | null;
  description: string | null;
  url: string | null;
}

interface EditAwardModalProps {
  award: Award | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAwardModal({ award, isOpen, onClose }: EditAwardModalProps) {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const updateAward = useUpdateAward();
  const deleteAward = useDeleteAward();

  useEffect(() => {
    if (award) {
      setTitle(award.title);
      setIssuer(award.issuer || '');
      setDateReceived(award.date_received || '');
      setDescription(award.description || '');
      setUrl(award.url || '');
    }
  }, [award]);

  const handleSubmit = async () => {
    if (!award || !title.trim()) {
      toast({ title: "Missing title", description: "Please enter the award title", variant: "destructive" });
      return;
    }

    try {
      await updateAward.mutateAsync({
        id: award.id,
        title,
        issuer: issuer || null,
        date_received: dateReceived || null,
        description: description || null,
        url: url || null,
      });
      toast({ title: "Award updated!", description: "Your award has been updated." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update award", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!award) return;

    try {
      await deleteAward.mutateAsync(award.id);
      toast({ title: "Award deleted", description: "Award has been removed from your profile." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete award", variant: "destructive" });
    }
  };

  const isLoading = updateAward.isPending || deleteAward.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Award</DialogTitle>
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
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {updateAward.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
