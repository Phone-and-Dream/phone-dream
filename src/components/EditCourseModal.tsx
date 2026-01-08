import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUpdateCourse, useDeleteCourse } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CourseStatus = Database['public']['Enums']['course_status'];
type Course = Database['public']['Tables']['courses']['Row'];

interface EditCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCourseModal({ course, isOpen, onClose }: EditCourseModalProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState<CourseStatus>('in_progress');
  const [progress, setProgress] = useState(0);
  const [certificateUrl, setCertificateUrl] = useState('');

  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  useEffect(() => {
    if (course) {
      setName(course.name);
      setProvider(course.provider);
      setStatus(course.status);
      setProgress(course.progress);
      setCertificateUrl(course.certificate_url || '');
    }
  }, [course]);

  const handleSubmit = async () => {
    if (!course || !name || !provider) return;

    try {
      await updateCourse.mutateAsync({
        id: course.id,
        name,
        provider,
        status,
        progress,
        certificate_url: certificateUrl || null,
      });
      
      toast({ title: "Course updated!", description: "Your changes have been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    try {
      await deleteCourse.mutateAsync(course.id);
      toast({ title: "Course deleted", description: "The course has been removed." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete course.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
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
            <Label htmlFor="certificate">Certificate URL</Label>
            <Input
              id="certificate"
              placeholder="https://..."
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{course?.name}" from your profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={updateCourse.isPending}>
              {updateCourse.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
