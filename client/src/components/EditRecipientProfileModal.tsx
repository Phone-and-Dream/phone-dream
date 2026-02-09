import { useState, useEffect, useRef } from 'react';
import { Loader2, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile, useUpdateRecipientProfile } from '@/hooks/useProfiles';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type RecipientProfile = Database['public']['Tables']['recipient_profiles']['Row'];

interface EditRecipientProfileModalProps {
  profile: Profile | null;
  recipientProfile: RecipientProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRecipientProfileModal({ profile, recipientProfile, isOpen, onClose }: EditRecipientProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [career, setCareer] = useState('');
  const [institution, setInstitution] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfile = useUpdateProfile();
  const updateRecipientProfile = useUpdateRecipientProfile();
  const avatarUpload = useAvatarUpload();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setCountry(profile.country || '');
      setAvatarPreview(profile.avatar_url);
    }
    if (recipientProfile) {
      setTagline(recipientProfile.tagline || '');
      setBio(recipientProfile.bio || '');
      setCareer((recipientProfile as any).career || '');
      setInstitution(recipientProfile.institution || '');
      setLinkedinUrl(recipientProfile.linkedin_url || '');
      setTwitterUrl(recipientProfile.twitter_url || '');
      setPortfolioUrl(recipientProfile.portfolio_url || '');
    }
  }, [profile, recipientProfile]);

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
        updateRecipientProfile.mutateAsync({
          tagline: tagline || null,
          bio: bio || null,
          career: career || null,
          institution: institution || null,
          linkedin_url: linkedinUrl || null,
          twitter_url: twitterUrl || null,
          portfolio_url: portfolioUrl || null,
        } as any),
      ]);
      toast({ title: "Profile updated!", description: "Your profile changes have been saved." });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const isLoading = updateProfile.isPending || updateRecipientProfile.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="full-name">Full Name</Label>
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
                placeholder="e.g., Lagos State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Nigeria"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              placeholder="A short bio or title (e.g., 'Aspiring Software Engineer')"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell your story..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="career">Career</Label>
              <Input
                id="career"
                placeholder="e.g., Software Developer"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">School/Organization</Label>
              <Input
                id="institution"
                placeholder="e.g., University of Lagos"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter/X URL</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/yourhandle"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              placeholder="https://yourportfolio.com"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
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
