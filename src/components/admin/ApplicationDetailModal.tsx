import { Mail, MapPin, Building, FileText, User, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import type { Application } from '@/lib/mockData';

interface ApplicationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onValidateReference: (appId: string, refIndex: number) => void;
}

export function ApplicationDetailModal({
  open,
  onOpenChange,
  application,
  onApprove,
  onReject,
  onValidateReference
}: ApplicationDetailModalProps) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{application.recipientName}</DialogTitle>
            <StatusBadge status={application.status} />
          </div>
          <DialogDescription>
            Application submitted on {new Date(application.submittedDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{application.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{application.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{application.creatorType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{application.institution}</span>
            </div>
          </div>

          <Separator />

          {/* Purpose */}
          <div>
            <h3 className="font-semibold mb-2">Purpose / Story</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              "{application.purpose}"
            </p>
          </div>

          <Separator />

          {/* References */}
          <div>
            <h3 className="font-semibold mb-3">References</h3>
            <div className="space-y-3">
              {application.references.map((ref, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{ref.name}</p>
                    <p className="text-sm text-muted-foreground">{ref.relationship}</p>
                    <p className="text-sm text-muted-foreground">{ref.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ref.isValidated ? (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validated
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onValidateReference(application.id, index)}
                      >
                        Mark Validated
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Letter */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <a href={application.referenceLetterUrl} className="text-sm text-primary hover:underline">
              View Reference Letter
            </a>
          </div>

          <Separator />

          {/* Actions */}
          {application.status === 'pending' && (
            <div className="flex justify-end gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  onReject(application.id);
                  onOpenChange(false);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  onApprove(application.id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
