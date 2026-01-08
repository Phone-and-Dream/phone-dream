import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateSkill } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type SkillCategory = Database['public']['Enums']['skill_category'];
type SkillLevel = Database['public']['Enums']['skill_level'];

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSkillModal({ isOpen, onClose }: AddSkillModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('technical');
  const [level, setLevel] = useState<SkillLevel>('beginner');
  const [progress, setProgress] = useState(0);

  const createSkill = useCreateSkill();

  const handleSubmit = async () => {
    if (!name) {
      toast({ title: "Name required", description: "Please enter a skill name.", variant: "destructive" });
      return;
    }

    try {
      await createSkill.mutateAsync({
        name,
        category,
        level,
        progress,
        recipient_id: '', // Will be set by the hook
      });
      
      toast({ title: "Skill added!", description: "Your skill has been saved." });
      resetForm();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('technical');
    setLevel('beginner');
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={createSkill.isPending}>
              {createSkill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Skill'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
