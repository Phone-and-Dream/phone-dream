import { useParams, Link } from 'react-router-dom';
import { Share2, Twitter, Linkedin, Copy, Gift, Users, Globe, MapPin, Calendar, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/stat-card';
import { NFTBadge } from '@/components/NFTBadge';
import { ImpactBadgesSection } from '@/components/ImpactBadgesSection';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { usePublicDonorProfile } from '@/hooks/useProfiles';
import { useDonorDonations } from '@/hooks/useDonations';

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy');

export default function DonorPublicProfile() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  
  const { data: donorData, isLoading: profileLoading } = usePublicDonorProfile(id);
  const { data: donations } = useDonorDonations(id);
  
  const profile = donorData?.profile;
  const profileUrl = `${window.location.origin}/donor/profile/${id}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out ${profile?.full_name || 'this donor'}'s impact on A Phone and A Dream! 🎁`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  // Get the badge variant based on total donations
  const getBadgeVariant = (total: number) => {
    if (total >= 25) return { name: 'Community Champion', emoji: '🏆', color: 'from-purple-500 to-pink-500' };
    if (total >= 10) return { name: 'Dream Enabler', emoji: '✨', color: 'from-amber-500 to-orange-500' };
    if (total >= 5) return { name: 'Digital Bridge', emoji: '🌉', color: 'from-blue-500 to-cyan-500' };
    return { name: 'Impact Pioneer', emoji: '🚀', color: 'from-green-500 to-emerald-500' };
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16">
          <div className="space-y-8">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!donorData || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">This donor profile doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/donor/register">Become a Donor</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const badgeVariant = getBadgeVariant(donorData.total_donated);
  const deliveredDonations = donations?.filter(d => d.status === 'delivered') || [];
  const displayName = donorData.organization_name || profile.full_name || 'Anonymous Donor';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 py-16">
          <div className="container">
            <BackButton className="mb-6" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl shadow-lg overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Badge Overlay */}
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${badgeVariant.color} flex items-center justify-center text-lg shadow-md`}>
                  {badgeVariant.emoji}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                  <h1 className="text-3xl font-display font-bold">{displayName}</h1>
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${badgeVariant.color} text-white`}>
                    {badgeVariant.emoji} {badgeVariant.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground justify-center md:justify-start flex-wrap">
                  <span className="flex items-center gap-1">
                    {donorData.donor_type === 'organization' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span className="capitalize">{donorData.donor_type}</span>
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Donor since {formatDate(donorData.created_at)}</span>
                </div>
              </div>
              
              {/* Share Buttons */}
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={shareToTwitter}>
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToLinkedIn}>
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyProfileLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy Link'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button asChild>
                  <Link to="/donor/register">
                    <Gift className="h-4 w-4 mr-2" />
                    Donate Like {displayName.split(' ')[0]}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard icon={<Gift className="h-5 w-5" />} label="Devices Donated" value={donorData.total_donated} />
              <StatCard icon={<Users className="h-5 w-5" />} label="Recipients Helped" value={donorData.recipients_helped} />
              <StatCard icon={<Globe className="h-5 w-5" />} label="Regions Reached" value={donorData.regions_reached} />
            </div>

            {/* Impact Story */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Impact Story</h2>
              <p className="text-muted-foreground">
                {displayName} has been making a difference since {formatDate(donorData.created_at)}. 
                Through their generous contributions of {donorData.total_donated} device{donorData.total_donated !== 1 ? 's' : ''}, 
                they have helped {donorData.recipients_helped} dreamer{donorData.recipients_helped !== 1 ? 's' : ''} across {donorData.regions_reached} region{donorData.regions_reached !== 1 ? 's' : ''}.
                Each donation creates a ripple effect of opportunity, enabling recipients to learn, create, and build their futures.
              </p>
            </div>

            {/* Impact Badges Section */}
            {id && <ImpactBadgesSection userId={id} userRole="donor" />}

            {/* Legacy Delivered Donations (fallback for old attestations) */}
            {deliveredDonations.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Legacy Impact Badges</h2>
                <p className="text-muted-foreground mb-6">
                  These badges represent verified donations from the previous attestation system.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {deliveredDonations.map((donation) => (
                    <NFTBadge
                      key={donation.id}
                      donorName={displayName}
                      donorId={id || ''}
                      recipientName={donation.recipient?.full_name || 'Recipient'}
                      recipientId={donation.matched_recipient_id || ''}
                      deviceType={donation.device_type}
                      condition={donation.condition}
                      txHash={donation.attestation?.[0]?.tx_hash || '0x0000...0000'}
                      date={donation.delivered_at || donation.created_at}
                      linkTo="recipient"
                      size="sm"
                      network={(donation.attestation?.[0]?.network as 'avalanche' | 'base') || 'avalanche'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Donations */}
            {donations && donations.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-display font-semibold mb-4">Donation History</h2>
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{donation.device_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.recipient ? (
                              <Link to={`/recipient/profile/${donation.matched_recipient_id}`} className="text-primary hover:underline">
                                {donation.recipient.full_name}
                              </Link>
                            ) : (
                              <span>Awaiting match</span>
                            )}
                            {' • '}{formatDate(donation.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        donation.status === 'delivered' ? 'bg-accent/20 text-accent-foreground' :
                        donation.status === 'matched' ? 'bg-blue-500/20 text-blue-600' :
                        donation.status === 'in_transit' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <span className="capitalize">{donation.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for no donations */}
            {(!donations || donations.length === 0) && (
              <div className="text-center py-12 glass-card rounded-2xl">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Donations Yet</h3>
                <p className="text-muted-foreground mb-4">This donor hasn't made any donations yet.</p>
              </div>
            )}

            {/* CTA */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-display font-bold mb-2">Inspired by {displayName.split(' ')[0]}?</h3>
              <p className="text-muted-foreground mb-4">Join the movement and make your own impact today.</p>
              <Button size="lg" asChild>
                <Link to="/donor/register">
                  <Gift className="h-5 w-5 mr-2" />
                  Donate a Device
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}