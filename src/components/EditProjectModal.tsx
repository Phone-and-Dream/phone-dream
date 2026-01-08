import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUpdateProject, useDeleteProject } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];
type Project = Database['public']['Tables']['projects']['Row'];

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [builtWithDonatedDevice, setBuiltWithDonatedDevice] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setTechStack(project.tech_stack?.join(', ') || '');
      setGithubUrl(project.github_url || '');
      setLiveUrl(project.live_url || '');
      setBuiltWithDonatedDevice(project.built_with_donated_device);
      setIsFeatured(project.is_featured);
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!project || !name) return;

    try {
      await updateProject.mutateAsync({
        id: project.id,
        name,
        description: description || null,
        status,
        tech_stack: techStack ? techStack.split(',').map(t => t.trim()).filter(Boolean) : null,
        github_url: githubUrl || null,
        live_url: liveUrl || null,
        built_with_donated_device: builtWithDonatedDevice,
        is_featured: isFeatured,
      });
      
      toast({ title: "Project updated!", description: "Your changes have been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await deleteProject.mutateAsync(project.id);
      toast({ title: "Project deleted", description: "The project has been removed." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="e.g., E-commerce Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tech-stack">Tech Stack (comma-separated)</Label>
            <Input
              id="tech-stack"
              placeholder="e.g., React, Node.js, PostgreSQL"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">GitHub URL</Label>
              <Input
                id="github-url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="live-url">Live URL</Label>
              <Input
                id="live-url"
                placeholder="https://..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="built-with-device"
                checked={builtWithDonatedDevice}
                onCheckedChange={(checked) => setBuiltWithDonatedDevice(checked as boolean)}
              />
              <Label htmlFor="built-with-device" className="text-sm cursor-pointer">
                Built with donated device
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                Featured project
              </Label>
            </div>
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
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{project?.name}" from your profile.
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
            <Button onClick={handleSubmit} className="flex-1" disabled={updateProject.isPending}>
              {updateProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
