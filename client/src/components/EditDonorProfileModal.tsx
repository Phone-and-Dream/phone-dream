import { useState, useEffect, useRef } from 'react';
import { Loader2, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile, useUpdateDonorProfile } from '@/hooks/useProfiles';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const updateDonorProfile = useUpdateDonorProfile();
  const avatarUpload = useAvatarUpload();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setCountry(profile.country || '');
      setAvatarPreview(profile.avatar_url);
    }
    if (donorProfile) {
      setDonorType(donorProfile.donor_type);
      setOrganizationName(donorProfile.organization_name || '');
    }
  }, [profile, donorProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      await avatarUpload.mutateAsync(file);
      toast({ title: "Photo updated!", description: "Your profile picture has been changed." });
    } catch (error) {
      toast({ title: "Upload failed", description: (error as Error).message, variant: "destructive" });
      // Reset preview on error
      setAvatarPreview(profile?.avatar_url || null);
    }
  };

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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-12 w-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUpload.isPending}
            >
              {avatarUpload.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {avatarUpload.isPending ? 'Uploading...' : 'Change Photo'}
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 2MB.</p>
          </div>

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
              <Label htmlFor="location">State</Label>
              <Input
                id="location"
                placeholder="e.g., California"
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
