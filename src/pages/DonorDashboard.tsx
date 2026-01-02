import { Link } from 'react-router-dom';
import { Gift, Users, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockDonors, formatDate } from '@/lib/mockData';

export default function DonorDashboard() {
  const donor = mockDonors[0]; // Demo: use first donor

  return (
    <DashboardLayout role="donor">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {donor.name}</h1>
            <p className="text-muted-foreground">Thank you for your generosity</p>
          </div>
          <Button asChild>
            <Link to="/donor/register"><Gift className="h-4 w-4 mr-2" /> Donate Another Device</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard icon={<Gift className="h-5 w-5" />} label="Devices Donated" value={donor.stats.totalDonated} />
          <StatCard icon={<Users className="h-5 w-5" />} label="Recipients Helped" value={donor.stats.recipientsHelped} />
          <StatCard icon={<Globe className="h-5 w-5" />} label="Regions Reached" value={donor.stats.regionsReached} />
        </div>

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
