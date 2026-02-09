import { useState, useEffect } from 'react';
import { Calendar, MapPin, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUpdateCareerEvent, useDeleteCareerEvent } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CareerEvent = Database['public']['Tables']['career_events']['Row'];
type CareerEventCategory = Database['public']['Enums']['career_event_category'];

interface EditCareerEventModalProps {
  event: CareerEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCareerEventModal({ event, isOpen, onClose }: EditCareerEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CareerEventCategory>('other');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const updateMutation = useUpdateCareerEvent();
  const deleteMutation = useDeleteCareerEvent();

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDate(event.date);
      setLocation(event.location || '');
      setCategory(event.category);
      setDescription(event.description || '');
      setSkills(event.skills_gained?.join(', ') || '');
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!event || !name || !date) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: event.id,
        name,
        date,
        location: location || null,
        category,
        description: description || null,
        skills_gained: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      });
      toast({ title: "Event updated!", description: "Your career event has been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update event", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteMutation.mutateAsync(event.id);
      toast({ title: "Event deleted", description: "Your career event has been removed." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  const isLoading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Career Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input
              id="event-name"
              placeholder="e.g., Lagos Tech Summit 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="event-location"
                  placeholder="City or Virtual"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as CareerEventCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="What did you learn or achieve at this event?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills Gained (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="e.g., Networking, React, Leadership"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={isLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Career Event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{event?.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
