import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateEmployment } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';

interface AddEmploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmploymentModal({ isOpen, onClose }: AddEmploymentModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const createEmployment = useCreateEmployment();

  const handleSubmit = async () => {
    if (!companyName.trim() || !jobTitle.trim() || !startDate) {
      toast({ title: "Missing fields", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      await createEmployment.mutateAsync({
        company_name: companyName,
        job_title: jobTitle,
        start_date: startDate,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
        description: description || null,
      });
      toast({ title: "Employment added!", description: "Your work experience has been added." });
      resetForm();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add employment", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setJobTitle('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company/Organization *</Label>
            <Input
              id="company"
              placeholder="e.g., Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title *</Label>
            <Input
              id="job-title"
              placeholder="e.g., Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-current"
              checked={isCurrent}
              onCheckedChange={(checked) => setIsCurrent(checked as boolean)}
            />
            <Label htmlFor="is-current" className="text-sm font-normal">
              I currently work here
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your role and responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={createEmployment.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={createEmployment.isPending}>
              {createEmployment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Employment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
