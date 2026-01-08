import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProfile, useUpdateRecipientProfile } from '@/hooks/useProfiles';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type RecipientProfile = Database['public']['Tables']['recipient_profiles']['Row'];
type CreatorType = Database['public']['Enums']['creator_type'];

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
  const [creatorType, setCreatorType] = useState<CreatorType>('other');
  const [institution, setInstitution] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const updateProfile = useUpdateProfile();
  const updateRecipientProfile = useUpdateRecipientProfile();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setLocation(profile.location || '');
      setCountry(profile.country || '');
    }
    if (recipientProfile) {
      setTagline(recipientProfile.tagline || '');
      setBio(recipientProfile.bio || '');
      setCreatorType(recipientProfile.creator_type || 'other');
      setInstitution(recipientProfile.institution || '');
      setLinkedinUrl(recipientProfile.linkedin_url || '');
      setTwitterUrl(recipientProfile.twitter_url || '');
      setPortfolioUrl(recipientProfile.portfolio_url || '');
    }
  }, [profile, recipientProfile]);

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
          creator_type: creatorType,
          institution: institution || null,
          linkedin_url: linkedinUrl || null,
          twitter_url: twitterUrl || null,
          portfolio_url: portfolioUrl || null,
        }),
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
              <Label htmlFor="location">City</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos"
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
              <Label>Creator Type</Label>
              <Select value={creatorType} onValueChange={(val) => setCreatorType(val as CreatorType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="educator">Educator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
