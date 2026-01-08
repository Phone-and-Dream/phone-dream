import { Link } from 'react-router-dom';
import { Gift, Users, Globe, ExternalLink, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { NFTBadge } from '@/components/NFTBadge';
import { mockDonors, formatDate } from '@/lib/mockData';

export default function DonorDashboard() {
  const donor = mockDonors[0]; // Demo: use first donor

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/donor/profile/${donor.id}`);
  };

  return (
    <DashboardLayout role="donor">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with profile actions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                {typeof donor.avatar === 'string' && donor.avatar.startsWith('http') ? (
                  <img src={donor.avatar} alt={donor.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  donor.avatar
                )}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{donor.name}</h1>
                <p className="text-muted-foreground">{donor.type} • {donor.location}</p>
                <p className="text-sm text-muted-foreground">Member since {formatDate(donor.memberSince)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyProfileLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Public Link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/donor/profile/${donor.id}`}>
                  <Share2 className="h-4 w-4 mr-2" />
                  View Public Profile
                </Link>
              </Button>
              <Button asChild>
                <Link to="/donor/register"><Gift className="h-4 w-4 mr-2" /> Donate Another Device</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard icon={<Gift className="h-5 w-5" />} label="Devices Donated" value={donor.stats.totalDonated} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Recipients Helped" value={donor.stats.recipientsHelped} />
          <StatCard icon={<Globe className="h-5 w-5" />} label="Regions Reached" value={donor.stats.regionsReached} />
        </div>

        {/* NFT Badges - Delivered Donations */}
        {donor.donations.filter(d => d.status === 'Delivered' && d.recipientId).length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-display font-semibold mb-6">Your Impact Badges (SBTs)</h2>
            <p className="text-muted-foreground mb-6">
              Each badge represents a verified donation on the blockchain. Click to view the recipient's journey.
            </p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {donor.donations
                .filter(d => d.status === 'Delivered' && d.recipientId)
                .map((donation) => (
                  <NFTBadge
                    key={donation.id}
                    donorName={donor.name}
                    donorId={donor.id}
                    recipientName={donation.recipientName || 'Recipient'}
                    recipientId={donation.recipientId || ''}
                    deviceType={donation.deviceType}
                    condition={donation.condition}
                    txHash={donation.txHash || '0x0000...0000'}
                    date={donation.date}
                    linkTo="recipient"
                  />
                ))}
            </div>
          </div>
        )}

        {/* Donation History Table */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Donation History</h2>
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
                {donor.donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-border/50">
                    <td className="py-4 font-medium">{donation.deviceType}</td>
                    <td className="py-4">{donation.condition}</td>
                    <td className="py-4">
                      {donation.recipientName ? (
                        <Link to={`/recipient/profile/${donation.recipientId}`} className="text-primary hover:underline">
                          {donation.recipientName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Pending match</span>
                      )}
                    </td>
                    <td className="py-4"><StatusBadge status={donation.status} /></td>
                    <td className="py-4 text-muted-foreground">{formatDate(donation.date)}</td>
                    <td className="py-4">
                      {donation.txHash ? (
                        <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                          {donation.txHash} <ExternalLink className="h-3 w-3" />
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
        </div>
      </div>
    </DashboardLayout>
  );
}
