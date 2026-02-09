import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUpdateSkill, useDeleteSkill } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type SkillCategory = Database['public']['Enums']['skill_category'];
type SkillLevel = Database['public']['Enums']['skill_level'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface EditSkillModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditSkillModal({ skill, isOpen, onClose }: EditSkillModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('technical');
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [progress, setProgress] = useState(0);

  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setCategory(skill.category);
      setLevel(skill.level);
      setProgress(skill.progress);
    }
  }, [skill]);

  const handleSubmit = async () => {
    if (!skill || !name) return;

    try {
      await updateSkill.mutateAsync({
        id: skill.id,
        name,
        category,
        level,
        progress,
      });
      
      toast({ title: "Skill updated!", description: "Your changes have been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update skill.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!skill) return;

    try {
      await deleteSkill.mutateAsync(skill.id);
      toast({ title: "Skill deleted", description: "The skill has been removed." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete skill.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Skill Name *</Label>
            <Input
              id="skill-name"
              placeholder="e.g., React, Python, UI Design"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(val) => setCategory(val as SkillCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proficiency Level</Label>
            <Select value={level} onValueChange={(val) => setLevel(val as SkillLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
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

          <div className="flex gap-3 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Skill?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{skill?.name}" from your profile.
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
            <Button onClick={handleSubmit} className="flex-1" disabled={updateSkill.isPending}>
              {updateSkill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
