import { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockApplications, mockDonors, mockRecipients, formatDate } from '@/lib/mockData';

export default function AdminDashboard() {
  const [applications, setApplications] = useState(mockApplications);

  const handleApprove = (id: string) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'approved' as const } : app));
  };

  const handleReject = (id: string) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'rejected' as const } : app));
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-display font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="applications">
          <TabsList className="mb-6">
            <TabsTrigger value="applications">Applications ({applications.filter(a => a.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Pending Applications</h2>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border border-border rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{app.recipientName}</h3>
                        <p className="text-sm text-muted-foreground">{app.creatorType} • {app.location}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm mb-3 line-clamp-2">{app.purpose}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View</Button>
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(app.id)}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}><X className="h-4 w-4 mr-1" /> Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="donations">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Recent Donations</h2>
              <div className="space-y-3">
                {mockDonors.flatMap(d => d.donations).slice(0, 6).map((don) => (
                  <div key={don.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{don.deviceType}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(don.date)}</p>
                    </div>
                    <StatusBadge status={don.status} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-4xl font-display font-bold text-primary">{mockRecipients.length}</p>
                <p className="text-muted-foreground">Total Recipients</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-4xl font-display font-bold text-primary">{mockDonors.length}</p>
                <p className="text-muted-foreground">Total Donors</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-4xl font-display font-bold text-primary">{mockDonors.reduce((sum, d) => sum + d.stats.totalDonated, 0)}</p>
                <p className="text-muted-foreground">Devices Donated</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
