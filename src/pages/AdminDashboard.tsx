import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, AlertTriangle, LogOut, Users, Package, TrendingUp, Clock, Link2, Search, FileText, User, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { MatchDeviceModal } from '@/components/admin/MatchDeviceModal';
import { ApplicationDetailModal } from '@/components/admin/ApplicationDetailModal';
import { ApplicationTrendChart, DonationsByRegionChart, DeviceTypeChart, XPGrowthChart } from '@/components/admin/AnalyticsCharts';
import { XPRulesManager } from '@/components/admin/XPRulesManager';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { mockApplications, mockDonors, mockRecipients, mockAttestationLogs, mockActivityLogs, getAllDonations, formatDate, type Application, type Donation } from '@/lib/mockData';
import { logAdminAction } from '@/lib/auditLog';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState(mockApplications);
  const [donations, setDonations] = useState(getAllDonations());
  const [appFilter, setAppFilter] = useState('all');
  const [donationFilter, setDonationFilter] = useState('all');
  const [userTab, setUserTab] = useState('recipients');

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isAppDetailOpen, setIsAppDetailOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const handleLogout = () => {
    logAdminAction({
      actionType: 'logout',
      description: 'Admin logged out of the dashboard',
    });
    sessionStorage.removeItem('adminAuthenticated');
    toast({ title: "Logged out", description: "You've been logged out of the admin panel." });
    navigate('/admin/login');
  };

  const handleApprove = (id: string) => {
    const app = applications.find(a => a.id === id);
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
    logAdminAction({
      actionType: 'approve_application',
      description: `Approved application for ${app?.recipientName}`,
      entityType: 'application',
      entityId: id,
      oldValue: { status: 'pending' },
      newValue: { status: 'approved' },
    });
    toast({ title: "Application Approved", description: "The recipient has been approved." });
  };

  const handleReject = (id: string) => {
    const app = applications.find(a => a.id === id);
    setApplications(apps => apps.map(a => a.id === id ? { ...a, status: 'rejected' as const } : a));
    logAdminAction({
      actionType: 'reject_application',
      description: `Rejected application for ${app?.recipientName}`,
      entityType: 'application',
      entityId: id,
      oldValue: { status: 'pending' },
      newValue: { status: 'rejected' },
    });
    toast({ title: "Application Rejected", description: "The application has been rejected." });
  };

  const handleValidateReference = (appId: string, refIndex: number) => {
    const app = applications.find(a => a.id === appId);
    const refName = app?.references[refIndex]?.name;
    setApplications(apps => apps.map(a => {
      if (a.id === appId) {
        const updatedRefs = [...a.references];
        updatedRefs[refIndex] = { ...updatedRefs[refIndex], isValidated: true };
        return { ...a, references: updatedRefs };
      }
      return a;
    }));
    logAdminAction({
      actionType: 'validate_reference',
      description: `Validated reference "${refName}" for ${app?.recipientName}`,
      entityType: 'application',
      entityId: appId,
      newValue: { reference: refName, validated: true },
    });
    toast({ title: "Reference Validated", description: "The reference has been marked as validated." });
  };

  const handleMatch = (donationId: string, recipientId: string, recipientName: string) => {
    const donation = donations.find(d => d.id === donationId);
    setDonations(dons => dons.map(d => 
      d.id === donationId ? { ...d, status: 'Matched' as const, recipientId, recipientName } : d
    ));
    logAdminAction({
      actionType: 'match_device',
      description: `Matched ${donation?.deviceType} to ${recipientName}`,
      entityType: 'donation',
      entityId: donationId,
      oldValue: { status: 'Pending', recipientId: null },
      newValue: { status: 'Matched', recipientId, recipientName },
    });
    toast({ title: "Device Matched!", description: `Device matched to ${recipientName}` });
  };

  const handleConfirmDelivery = (donationId: string) => {
    const donation = donations.find(d => d.id === donationId);
    const txHash = `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`;
    setDonations(dons => dons.map(d => 
      d.id === donationId ? { ...d, status: 'Delivered' as const, txHash } : d
    ));
    logAdminAction({
      actionType: 'confirm_delivery',
      description: `Confirmed delivery of ${donation?.deviceType} to ${donation?.recipientName}`,
      entityType: 'donation',
      entityId: donationId,
      oldValue: { status: 'Matched' },
      newValue: { status: 'Delivered', txHash },
    });
    toast({ title: "Delivery Confirmed", description: `Transaction hash: ${txHash}` });
  };

  const filteredApplications = applications.filter(app => 
    appFilter === 'all' || app.status === appFilter
  );

  const filteredDonations = donations.filter(d => 
    donationFilter === 'all' || d.status === donationFilter
  );

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const pendingMatches = donations.filter(d => d.status === 'Pending').length;
  const totalDevices = mockDonors.reduce((sum, d) => sum + d.stats.totalDonated, 0);

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto">
        {/* Demo Banner */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Demo Mode - Prototype View</h3>
            <p className="text-sm text-muted-foreground">This admin panel displays sample data for demonstration purposes.</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">DEMO</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications ({pendingCount})</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="xp">XP Management</TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-4 w-4 mr-1" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-primary">{mockRecipients.length}</p>
                <p className="text-sm text-muted-foreground">Recipients</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-info" />
                <p className="text-3xl font-bold text-info">{mockDonors.length}</p>
                <p className="text-sm text-muted-foreground">Donors</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-3xl font-bold text-success">{totalDevices}</p>
                <p className="text-sm text-muted-foreground">Devices</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-warning" />
                <p className="text-3xl font-bold text-warning">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Apps</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Link2 className="h-6 w-6 mx-auto mb-2 text-destructive" />
                <p className="text-3xl font-bold text-destructive">{pendingMatches}</p>
                <p className="text-sm text-muted-foreground">To Match</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {mockActivityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p>{log.description}</p>
                        <p className="text-muted-foreground text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <FileText className="h-5 w-5 mb-1" />
                    <span className="text-xs">Review Apps</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Link2 className="h-5 w-5 mb-1" />
                    <span className="text-xs">Match Devices</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <TrendingUp className="h-5 w-5 mb-1" />
                    <span className="text-xs">Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs">View Users</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* APPLICATIONS TAB */}
          <TabsContent value="applications">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <Select value={appFilter} onValueChange={setAppFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search applications..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-4">
                {filteredApplications.map(app => (
                  <div key={app.id} className="p-4 border rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{app.recipientName}</h3>
                        <p className="text-sm text-muted-foreground">{app.creatorType} • {app.location}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">{app.purpose}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>References: {app.references.filter(r => r.isValidated).length}/{app.references.length} validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedApplication(app); setIsAppDetailOpen(true); }}>
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(app.id)}><Check className="h-4 w-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}><X className="h-4 w-4 mr-1" />Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* DONATIONS TAB */}
          <TabsContent value="donations">
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="font-semibold">All Donations</h2>
                <Select value={donationFilter} onValueChange={setDonationFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Matched">Matched</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.deviceType}</TableCell>
                      <TableCell>{d.donorName}</TableCell>
                      <TableCell>{d.recipientName || '-'}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                      <TableCell>{formatDate(d.date)}</TableCell>
                      <TableCell>
                        {d.status === 'Pending' && (
                          <Button size="sm" onClick={() => { setSelectedDonation(d); setIsMatchModalOpen(true); }}>Match</Button>
                        )}
                        {d.status === 'Matched' && (
                          <Button size="sm" variant="outline" onClick={() => handleConfirmDelivery(d.id)}>Confirm Delivery</Button>
                        )}
                        {d.status === 'Delivered' && (
                          <span className="text-xs text-muted-foreground">{d.txHash}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">Blockchain Attestation Logs</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Donor → Recipient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Network</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttestationLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.txHash}</TableCell>
                      <TableCell>{log.deviceType}</TableCell>
                      <TableCell>{log.donorName} → {log.recipientName}</TableCell>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell><Badge variant="outline">{log.network}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="glass-card rounded-xl p-6">
              <Tabs value={userTab} onValueChange={setUserTab}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="recipients">Recipients</TabsTrigger>
                    <TabsTrigger value="donors">Donors</TabsTrigger>
                  </TabsList>
                  <Button variant="outline" size="sm">Export CSV</Button>
                </div>

                <TabsContent value="recipients">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRecipients.map(r => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={r.avatar} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{r.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{r.creatorType}</TableCell>
                          <TableCell>{r.location}, {r.country}</TableCell>
                          <TableCell><Badge variant="outline">{r.xp} XP</Badge></TableCell>
                          <TableCell>{r.deviceReceived ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                          <TableCell>{formatDate(r.memberSince)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="donors">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Donated</TableHead>
                        <TableHead>Helped</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDonors.map(d => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={d.avatar} />
                                <AvatarFallback>{d.avatar}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{d.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{d.type}</TableCell>
                          <TableCell>{d.location}</TableCell>
                          <TableCell>{d.stats.totalDonated}</TableCell>
                          <TableCell>{d.stats.recipientsHelped}</TableCell>
                          <TableCell>{formatDate(d.memberSince)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Applications</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-success">+25% vs last month</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Approval Rate</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-success">+5% vs last month</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Devices Donated</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-success">+33% vs last month</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Avg XP Growth</span>
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                </div>
                <p className="text-2xl font-bold">+450</p>
                <p className="text-xs text-destructive">-10% vs last month</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ApplicationTrendChart />
              <DeviceTypeChart />
              <DonationsByRegionChart />
              <XPGrowthChart />
            </div>
          </TabsContent>

          {/* XP MANAGEMENT TAB */}
          <TabsContent value="xp">
            <XPRulesManager />
          </TabsContent>

          {/* AUDIT LOG TAB */}
          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ApplicationDetailModal
          open={isAppDetailOpen}
          onOpenChange={setIsAppDetailOpen}
          application={selectedApplication}
          onApprove={handleApprove}
          onReject={handleReject}
          onValidateReference={handleValidateReference}
        />
        <MatchDeviceModal
          open={isMatchModalOpen}
          onOpenChange={setIsMatchModalOpen}
          donation={selectedDonation}
          onMatch={handleMatch}
        />
      </div>
    </DashboardLayout>
  );
}
