import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProfile, useUpdateDonorProfile } from '@/hooks/useProfiles';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type DonorProfile = Database['public']['Tables']['donor_profiles']['Row'];
type DonorType = Database['public']['Enums']['donor_type'];

interface EditDonorProfileModalProps {
  profile: Profile | null;
  donorProfile: DonorProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDonorProfileModal({ profile, donorProfile, isOpen, onClose }: EditDonorProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [donorType, setDonorType] = useState<DonorType>('individual');
  const [organizationName, setOrganizationName] = useState('');

  const updateProfile = useUpdateProfile();
  const updateDonorProfile = useUpdateDonorProfile();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setCountry(profile.country || '');
    }
    if (donorProfile) {
      setDonorType(donorProfile.donor_type);
      setOrganizationName(donorProfile.organization_name || '');
    }
  }, [profile, donorProfile]);

  const handleSubmit = async () => {
    try {
      await Promise.all([
        updateProfile.mutateAsync({
          full_name: fullName || null,
          location: location || null,
          country: country || null,
        }),
        updateDonorProfile.mutateAsync({
          donor_type: donorType,
          organization_name: donorType === 'organization' ? organizationName || null : null,
        }),
      ]);
      toast({ title: "Profile updated!", description: "Your profile changes have been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const isLoading = updateProfile.isPending || updateDonorProfile.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Donor Type</Label>
            <Select value={donorType} onValueChange={(val) => setDonorType(val as DonorType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {donorType === 'organization' && (
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Your organization name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="full-name">{donorType === 'organization' ? 'Contact Name' : 'Full Name'}</Label>
            <Input
              id="full-name"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">City</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
