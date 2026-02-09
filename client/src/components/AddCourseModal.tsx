import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateCourse } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CourseStatus = Database['public']['Enums']['course_status'];

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCourseModal({ isOpen, onClose }: AddCourseModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState<CourseStatus>('in_progress');
  const [progress, setProgress] = useState(0);
  const [certificateUrl, setCertificateUrl] = useState('');

  const createCourse = useCreateCourse();

  const handleSubmit = async () => {
    if (!name || !provider) {
      toast({ title: "Required fields", description: "Please enter course name and provider.", variant: "destructive" });
      return;
    }

    try {
      await createCourse.mutateAsync({
        name,
        provider,
        status,
        progress,
        certificate_url: certificateUrl || null,
        recipient_id: '', // Will be set by the hook
      });
      
      toast({ title: "Course added!", description: "Your course has been saved." });
      resetForm();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add course.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setName('');
    setProvider('');
    setStatus('in_progress');
    setProgress(0);
    setCertificateUrl('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name *</Label>
            <Input
              id="course-name"
              placeholder="e.g., React - The Complete Guide"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              placeholder="e.g., Coursera, Udemy, freeCodeCamp"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as CourseStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Progress</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(val) => setProgress(val[0])}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate">Certificate URL (optional)</Label>
            <Input
              id="certificate"
              placeholder="https://..."
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={createCourse.isPending}>
              {createCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Course'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
