import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Users, Globe, ExternalLink, Copy, Share2, Loader2, Pencil, DollarSign } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { NFTBadge } from '@/components/NFTBadge';
import { EditDonorProfileModal } from '@/components/EditDonorProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile, useMyDonorProfile } from '@/hooks/useProfiles';
import { useMyDonations } from '@/hooks/useDonations';
import { useMyCashDonations } from '@/hooks/useCashDonations';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function DonorDashboard() {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: donorProfile, isLoading: donorLoading } = useMyDonorProfile();
  const { data: donations = [], isLoading: donationsLoading } = useMyDonations();
  const { data: cashDonations = [], isLoading: cashLoading } = useMyCashDonations();

  const isLoading = profileLoading || donorLoading || donationsLoading || cashLoading;

  const copyProfileLink = () => {
    if (user?.id) {
      navigator.clipboard.writeText(`${window.location.origin}/donor/profile/${user.id}`);
      toast({ title: "Link copied!", description: "Public profile link copied to clipboard." });
    }
  };

  // Calculate stats from real data
  const totalCashDonated = cashDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const stats = {
    totalDonated: donorProfile?.total_donated || donations.length,
    recipientsHelped: donorProfile?.recipients_helped || donations.filter(d => d.status === 'delivered').length,
    regionsReached: donorProfile?.regions_reached || 1,
    cashDonated: totalCashDonated,
  };

  // Get delivered donations for NFT badges
  const deliveredDonations = donations.filter(d => d.status === 'delivered' && d.matched_recipient_id);

  if (isLoading) {
    return (
      <DashboardLayout role="donor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="donor">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with profile actions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || donorProfile?.organization_name || 'Profile'} className="object-cover rounded-2xl" />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
                  {profile?.full_name?.charAt(0) || donorProfile?.organization_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-display font-bold">
                  {donorProfile?.organization_name || profile?.full_name || 'Your Name'}
                </h1>
                <p className="text-muted-foreground">
                  {donorProfile?.donor_type === 'organization' ? 'Organization' : 'Individual Donor'} • {profile?.location || 'Location not set'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Member since {format(new Date(profile?.created_at || new Date()), 'MMM yyyy')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setIsEditProfileModalOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={copyProfileLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Public Link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/donor/profile/${user?.id}`}>
                  <Share2 className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/donor/cash-donate"><DollarSign className="h-4 w-4 mr-2" /> Donate Cash</Link>
              </Button>
              <Button asChild>
                <Link to="/donor/register"><Gift className="h-4 w-4 mr-2" /> Donate Device</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* First time donor CTA */}
        {donations.length === 0 && (
          <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-display font-bold mb-2">Ready to Make a Difference?</h2>
                <p className="text-muted-foreground mb-4">
                  Your unused device could change someone's life. Donate your first device and help a creator achieve their dreams.
                </p>
                <Button asChild size="lg">
                  <Link to="/donor/donate">
                    <Gift className="h-5 w-5 mr-2" />
                    Donate Your First Device
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard icon={<Gift className="h-5 w-5" />} label="Devices Donated" value={stats.totalDonated} />
          <StatCard icon={<DollarSign className="h-5 w-5" />} label="Cash Donated" value={`$${stats.cashDonated.toLocaleString()}`} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Recipients Helped" value={stats.recipientsHelped} />
          <StatCard icon={<Globe className="h-5 w-5" />} label="Regions Reached" value={stats.regionsReached} />
        </div>

        {/* NFT Badges - Delivered Donations */}
        {deliveredDonations.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6">Your Impact Badges (SBTs)</h2>
            <p className="text-muted-foreground mb-6">
              Each badge represents a verified donation on the blockchain. Click to view the recipient's journey.
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {deliveredDonations.map((donation) => (
                <NFTBadge
                  key={donation.id}
                  donorName={profile?.full_name || donorProfile?.organization_name || 'Donor'}
                  donorId={user?.id || ''}
                  recipientName="Recipient"
                  recipientId={donation.matched_recipient_id || ''}
                  deviceType={donation.device_type}
                  condition={donation.condition === 'new' ? 'New' : 'Refurbished'}
                  txHash="0x0000...0000"
                  date={donation.delivered_at || donation.created_at}
                  linkTo="recipient"
                />
              ))}
            </div>
          </div>
        )}

        {/* Device Donation History Table */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Device Donation History</h2>
          {donations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Device</th>
                    <th className="pb-3 font-medium">Condition</th>
                    <th className="pb-3 font-medium">Recipient</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Verification</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-b border-border/50">
                      <td className="py-4 font-medium">{donation.device_type}</td>
                      <td className="py-4 capitalize">{donation.condition}</td>
                      <td className="py-4">
                        {donation.matched_recipient_id ? (
                          <Link to={`/recipient/profile/${donation.matched_recipient_id}`} className="text-primary hover:underline">
                            View Recipient
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Pending match</span>
                        )}
                      </td>
                      <td className="py-4"><StatusBadge status={donation.status} /></td>
                      <td className="py-4 text-muted-foreground">{format(new Date(donation.created_at), 'MMM d, yyyy')}</td>
                      <td className="py-4">
                        {donation.status === 'delivered' ? (
                          <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                            View on BaseScan <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No device donations yet. Make your first donation to see it here!</p>
              <Button asChild className="mt-4">
                <Link to="/donor/register">Donate a Device</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Cash Donation History Table */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Cash Donation History</h2>
          {cashDonations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Allocation</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {cashDonations.map((donation) => (
                    <tr key={donation.id} className="border-b border-border/50">
                      <td className="py-4 font-medium">${donation.amount.toLocaleString()} {donation.currency}</td>
                      <td className="py-4 capitalize">
                        {donation.allocation_method === 'platform' 
                          ? 'Platform Choice' 
                          : donation.linked_recipient_id 
                            ? 'Specific Recipient'
                            : donation.linked_dream_request_id
                              ? 'Dream Request'
                              : donation.allocation_method}
                      </td>
                      <td className="py-4"><StatusBadge status={donation.status} /></td>
                      <td className="py-4 text-muted-foreground">{format(new Date(donation.created_at), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cash donations yet.</p>
              <Button asChild className="mt-4">
                <Link to="/donor/cash-donate">Make a Cash Donation</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditDonorProfileModal 
        profile={profile} 
        donorProfile={donorProfile} 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
