import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateProject } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ProjectStatus = Database['public']['Enums']['project_status'];

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [builtWithDonatedDevice, setBuiltWithDonatedDevice] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const createProject = useCreateProject();

  const handleSubmit = async () => {
    if (!name) {
      toast({ title: "Name required", description: "Please enter a project name.", variant: "destructive" });
      return;
    }

    try {
      await createProject.mutateAsync({
        name,
        description: description || null,
        status,
        tech_stack: techStack ? techStack.split(',').map(t => t.trim()).filter(Boolean) : null,
        github_url: githubUrl || null,
        live_url: liveUrl || null,
        built_with_donated_device: builtWithDonatedDevice,
        is_featured: isFeatured,
        recipient_id: '', // Will be set by the hook
      });
      
      toast({ title: "Project added!", description: "Your project has been saved." });
      resetForm();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add project.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('in_progress');
    setTechStack('');
    setGithubUrl('');
    setLiveUrl('');
    setBuiltWithDonatedDevice(false);
    setIsFeatured(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={createProject.isPending}>
              {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
