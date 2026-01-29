import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateEmployment, useDeleteEmployment } from '@/hooks/useRecipientData';
import { toast } from '@/hooks/use-toast';

interface Employment {
  id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
}

interface EditEmploymentModalProps {
  employment: Employment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditEmploymentModal({ employment, isOpen, onClose }: EditEmploymentModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const updateEmployment = useUpdateEmployment();
  const deleteEmployment = useDeleteEmployment();

  useEffect(() => {
    if (employment) {
      setCompanyName(employment.company_name);
      setJobTitle(employment.job_title);
      setStartDate(employment.start_date);
      setEndDate(employment.end_date || '');
      setIsCurrent(employment.is_current || false);
      setDescription(employment.description || '');
    }
  }, [employment]);

  const handleSubmit = async () => {
    if (!employment || !companyName.trim() || !jobTitle.trim() || !startDate) {
      toast({ title: "Missing fields", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      await updateEmployment.mutateAsync({
        id: employment.id,
        company_name: companyName,
        job_title: jobTitle,
        start_date: startDate,
        end_date: isCurrent ? null : endDate || null,
        is_current: isCurrent,
        description: description || null,
      });
      toast({ title: "Employment updated!", description: "Your work experience has been updated." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update employment", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!employment) return;

    try {
      await deleteEmployment.mutateAsync(employment.id);
      toast({ title: "Employment deleted", description: "Work experience has been removed." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete employment", variant: "destructive" });
    }
  };

  const isLoading = updateEmployment.isPending || deleteEmployment.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employment</DialogTitle>
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
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {updateEmployment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
