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
import type { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type Application = Database['public']['Tables']['applications']['Row'] & {
  profile?: Database['public']['Tables']['profiles']['Row'] | null;
  references?: Database['public']['Tables']['application_references']['Row'][];
};

interface ApplicationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onValidateReference: (appId: string, refId: string) => void;
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

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{application.profile?.full_name || 'Unknown Applicant'}</DialogTitle>
            <StatusBadge status={application.status} />
          </div>
          <DialogDescription>
            Application submitted on {formatDate(application.submitted_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{application.profile?.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{application.profile?.location || 'Unknown location'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Needs: {application.device_needed}</span>
            </div>
            {application.profile?.country && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{application.profile.country}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Purpose */}
          <div>
            <h3 className="font-semibold mb-2">Purpose / Story</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              "{application.purpose}"
            </p>
          </div>

          {application.additional_info && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  {application.additional_info}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* References */}
          <div>
            <h3 className="font-semibold mb-3">References</h3>
            <div className="space-y-3">
              {application.references && application.references.length > 0 ? (
                application.references.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{ref.name}</p>
                      <p className="text-sm text-muted-foreground">{ref.relationship}</p>
                      <p className="text-sm text-muted-foreground">{ref.contact}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ref.is_validated ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validated
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onValidateReference(application.id, ref.id)}
                        >
                          Mark Validated
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No references provided</p>
              )}
            </div>
          </div>

          {/* Reference Letter */}
          {application.reference_letter_url && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a href={application.reference_letter_url} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                View Reference Letter
              </a>
            </div>
          )}

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
