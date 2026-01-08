import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, AlertTriangle, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockApplications, mockDonors, mockRecipients, formatDate } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState(mockApplications);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    toast({
      title: "Logged out",
      description: "You've been logged out of the admin panel.",
    });
    navigate('/admin/login');
  };

  const handleApprove = (id: string) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'approved' as const } : app));
  };

  const handleReject = (id: string) => {
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'rejected' as const } : app));
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-6xl mx-auto">
        {/* Demo Mode Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Demo Mode - Prototype View</h3>
            <p className="text-sm text-muted-foreground">
              This admin panel displays sample data for demonstration purposes. 
              In production, this would require secure authentication and role-based access control.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">DEMO</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

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
