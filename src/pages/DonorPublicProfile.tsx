import { useParams, Link } from 'react-router-dom';
import { Share2, Twitter, Linkedin, Copy, Gift, Users, Globe, MapPin, Calendar, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/stat-card';
import { NFTBadge } from '@/components/NFTBadge';
import { mockDonors, formatDate } from '@/lib/mockData';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export default function DonorPublicProfile() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  
  const donor = mockDonors.find(d => d.id === id) || mockDonors[0];
  const profileUrl = `${window.location.origin}/donor/profile/${donor.id}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out ${donor.name}'s impact on A Phone and A Dream! 🎁`;
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

  const badgeVariant = getBadgeVariant(donor.stats.totalDonated);
  const deliveredDonations = donor.donations.filter(d => d.status === 'Delivered');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl shadow-lg">
                  {typeof donor.avatar === 'string' && donor.avatar.startsWith('http') ? (
                    <img src={donor.avatar} alt={donor.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    donor.avatar
                  )}
                </div>
                {/* Badge Overlay */}
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${badgeVariant.color} flex items-center justify-center text-lg shadow-md`}>
                  {badgeVariant.emoji}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                  <h1 className="text-3xl font-display font-bold">{donor.name}</h1>
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${badgeVariant.color} text-white`}>
                    {badgeVariant.emoji} {badgeVariant.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground justify-center md:justify-start flex-wrap">
                  <span className="flex items-center gap-1">
                    {donor.type === 'Organization' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {donor.type}
                  </span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {donor.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Donor since {formatDate(donor.memberSince)}</span>
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
                    Donate Like {donor.name.split(' ')[0]}
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
              <StatCard icon={<Gift className="h-5 w-5" />} label="Devices Donated" value={donor.stats.totalDonated} />
              <StatCard icon={<Users className="h-5 w-5" />} label="Recipients Helped" value={donor.stats.recipientsHelped} />
              <StatCard icon={<Globe className="h-5 w-5" />} label="Regions Reached" value={donor.stats.regionsReached} />
            </div>

            {/* Impact Story */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Impact Story</h2>
              <p className="text-muted-foreground">
                {donor.name} has been making a difference since {formatDate(donor.memberSince)}. 
                Through their generous contributions of {donor.stats.totalDonated} device{donor.stats.totalDonated !== 1 ? 's' : ''}, 
                they have helped {donor.stats.recipientsHelped} dreamer{donor.stats.recipientsHelped !== 1 ? 's' : ''} across {donor.stats.regionsReached} region{donor.stats.regionsReached !== 1 ? 's' : ''}.
                Each donation creates a ripple effect of opportunity, enabling recipients to learn, create, and build their futures.
              </p>
            </div>

            {/* Delivered Donations with NFT Badges */}
            {deliveredDonations.length > 0 && (
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Impact Badges</h2>
                <p className="text-muted-foreground mb-6">
                  Each badge represents a verified donation, permanently recorded on the blockchain as a Soulbound Token (SBT).
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {deliveredDonations.map((donation) => (
                    <NFTBadge
                      key={donation.id}
                      donorName={donor.name}
                      donorId={donor.id}
                      recipientName={donation.recipientName || 'Recipient'}
                      recipientId={donation.recipientId || '1'}
                      deviceType={donation.deviceType}
                      condition={donation.condition}
                      txHash={donation.txHash || '0x0000...0000'}
                      date={donation.date}
                      linkTo="recipient"
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Donations */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Donation History</h2>
              <div className="space-y-3">
                {donor.donations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.deviceType}</p>
                        <p className="text-sm text-muted-foreground">
                          {donation.recipientName ? (
                            <Link to={`/recipient/profile/${donation.recipientId}`} className="text-primary hover:underline">
                              {donation.recipientName}
                            </Link>
                          ) : (
                            <span>Awaiting match</span>
                          )}
                          {' • '}{formatDate(donation.date)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      donation.status === 'Delivered' ? 'bg-accent/20 text-accent-foreground' :
                      donation.status === 'Matched' ? 'bg-blue-500/20 text-blue-600' :
                      'bg-amber-500/20 text-amber-600'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-display font-bold mb-2">Inspired by {donor.name}?</h3>
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
