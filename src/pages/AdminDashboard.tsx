import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Eye, AlertTriangle, LogOut, Users, Package, TrendingUp, Clock, Link2, Search, FileText, User, ArrowUpRight, ArrowDownRight, History, Loader2, ShieldCheck, Camera, ClipboardList, Cpu, UserPlus } from 'lucide-react';
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
import { DeviceVerificationModal } from '@/components/admin/DeviceVerificationModal';
import { ApplicationTrendChart, DonationsByRegionChart, DeviceTypeChart, XPGrowthChart, CashDonationsTrendChart } from '@/components/admin/AnalyticsCharts';
import { XPRulesManager } from '@/components/admin/XPRulesManager';
import { useAllCashDonations } from '@/hooks/useCashDonations';
import { TaskManager } from '@/components/admin/TaskManager';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { DeviceImpactManager } from '@/components/admin/DeviceImpactManager';
import { WaitlistManager } from '@/components/admin/WaitlistManager';
import { logAdminAction } from '@/lib/auditLog';
import { getStatusLabel, getStatusColor } from '@/lib/donationStateMachine';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAllApplications, useUpdateApplication } from '@/hooks/useApplications';
import { useAllDonations, useUpdateDonation } from '@/hooks/useDonations';
import { useAllRecipientProfiles, useAllDonorProfiles, useAttestations, useActivityLogs, useUpdateApplicationReference, useCreateAttestation } from '@/hooks/useAdminData';
import { usePendingVerifications, useMakeMatchable } from '@/hooks/useDeviceVerification';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type ApplicationWithDetails = Database['public']['Tables']['applications']['Row'] & {
  profile?: Database['public']['Tables']['profiles']['Row'] | null;
  references?: Database['public']['Tables']['application_references']['Row'][];
};

type DonationWithDetails = Database['public']['Tables']['donations']['Row'] & {
  donor?: Database['public']['Tables']['profiles']['Row'] | null;
  recipient?: Database['public']['Tables']['profiles']['Row'] | null;
  attestation?: Database['public']['Tables']['attestations']['Row'][] | null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const { signOut } = useAuth();
  
  // Data queries
  const { data: applications = [], isLoading: appsLoading } = useAllApplications();
  const { data: donations = [], isLoading: donationsLoading } = useAllDonations();
  const { data: recipientProfiles = [], isLoading: recipientsLoading } = useAllRecipientProfiles();
  const { data: donorProfiles = [], isLoading: donorsLoading } = useAllDonorProfiles();
  const { data: attestations = [] } = useAttestations();
  const { data: activityLogs = [] } = useActivityLogs();
  const { data: pendingVerifications = [], isLoading: verificationsLoading } = usePendingVerifications();
  const { data: cashDonations = [], isLoading: cashLoading } = useAllCashDonations();
  
  // Mutations
  const updateApplication = useUpdateApplication();
  const updateDonation = useUpdateDonation();
  const updateReference = useUpdateApplicationReference();
  const createAttestation = useCreateAttestation();
  const makeMatchable = useMakeMatchable();

  // Filter states
  const [appFilter, setAppFilter] = useState('all');
  const [donationFilter, setDonationFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('pending');
  const [userTab, setUserTab] = useState('recipients');

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [isAppDetailOpen, setIsAppDetailOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationWithDetails | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleLogout = async () => {
    await logAdminAction({
      actionType: 'logout',
      description: 'Admin logged out of the dashboard',
    });
    await signOut();
    toast({ title: "Logged out", description: "You've been logged out of the admin panel." });
    navigate('/admin/login');
  };

  const handleApprove = async (id: string) => {
    const app = applications.find(a => a.id === id);
    try {
      await updateApplication.mutateAsync({
        id,
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      });
      await logAdminAction({
        actionType: 'approve_application',
        description: `Approved application for ${app?.profile?.full_name || 'Unknown'}`,
        entityType: 'application',
        entityId: id,
        oldValue: { status: 'pending' },
        newValue: { status: 'approved' },
      });
      toast({ title: "Application Approved", description: "The recipient has been approved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve application", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    const app = applications.find(a => a.id === id);
    try {
      await updateApplication.mutateAsync({
        id,
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      });
      await logAdminAction({
        actionType: 'reject_application',
        description: `Rejected application for ${app?.profile?.full_name || 'Unknown'}`,
        entityType: 'application',
        entityId: id,
        oldValue: { status: 'pending' },
        newValue: { status: 'rejected' },
      });
      toast({ title: "Application Rejected", description: "The application has been rejected." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject application", variant: "destructive" });
    }
  };

  const handleValidateReference = async (appId: string, refId: string) => {
    const app = applications.find(a => a.id === appId);
    const ref = app?.references?.find(r => r.id === refId);
    try {
      await updateReference.mutateAsync({
        id: refId,
        is_validated: true,
      });
      await logAdminAction({
        actionType: 'validate_reference',
        description: `Validated reference "${ref?.name}" for ${app?.profile?.full_name || 'Unknown'}`,
        entityType: 'application',
        entityId: appId,
        newValue: { reference: ref?.name, validated: true },
      });
      toast({ title: "Reference Validated", description: "The reference has been marked as validated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to validate reference", variant: "destructive" });
    }
  };

  const handleMatch = async (donationId: string, recipientId: string, recipientName: string) => {
    const donation = donations.find(d => d.id === donationId);
    try {
      await updateDonation.mutateAsync({
        id: donationId,
        matched_recipient_id: recipientId,
        matched_at: new Date().toISOString(),
        status: 'matched',
      });
      await logAdminAction({
        actionType: 'match_device',
        description: `Matched ${donation?.device_type} to ${recipientName}`,
        entityType: 'donation',
        entityId: donationId,
        oldValue: { status: 'pending', recipientId: null },
        newValue: { status: 'matched', recipientId, recipientName },
      });
      toast({ title: "Device Matched!", description: `Device matched to ${recipientName}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to match device", variant: "destructive" });
    }
  };

  const handleConfirmDelivery = async (donationId: string) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation || !donation.matched_recipient_id) return;
    
    try {
      // Update donation status
      await updateDonation.mutateAsync({
        id: donationId,
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });
      
      // Create blockchain attestation
      const result = await createAttestation.mutateAsync({
        donation_id: donationId,
        donor_id: donation.donor_id,
        recipient_id: donation.matched_recipient_id,
        device_type: donation.device_type,
        condition: donation.condition,
      });
      
      await logAdminAction({
        actionType: 'confirm_delivery',
        description: `Confirmed delivery of ${donation.device_type} to ${donation.recipient?.full_name || 'recipient'}`,
        entityType: 'donation',
        entityId: donationId,
        oldValue: { status: 'matched' },
        newValue: { status: 'delivered', txHash: result.attestation?.tx_hash },
      });
      
      const isDemoMode = result.attestation?.metadata?.demo_mode;
      toast({ 
        title: "Delivery Confirmed", 
        description: isDemoMode 
          ? `Demo attestation created: ${result.attestation?.tx_hash}`
          : `Transaction hash: ${result.attestation?.tx_hash}`
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to confirm delivery", variant: "destructive" });
    }
  };

  const filteredApplications = (applications as ApplicationWithDetails[]).filter(app => 
    appFilter === 'all' || app.status === appFilter
  );

  const filteredDonations = (donations as DonationWithDetails[]).filter(d => 
    donationFilter === 'all' || d.status === donationFilter
  );

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const pendingMatches = donations.filter(d => d.status === 'matchable').length;
  const pendingVerificationCount = pendingVerifications.length;
  const totalDevices = donations.length;
  const totalCashReceived = cashDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const isLoading = appsLoading || donationsLoading || recipientsLoading || donorsLoading || cashLoading;

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            {applications.length === 0 && donations.length === 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">No data yet</Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>

        <Tabs value={currentTab} onValueChange={(value) => {
          if (value === 'overview') {
            setSearchParams({});
          } else {
            setSearchParams({ tab: value });
          }
        }}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verification" className="relative">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Verification
              {pendingVerificationCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {pendingVerificationCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">Applications ({pendingCount})</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="h-4 w-4 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="xp">XP Management</TabsTrigger>
            <TabsTrigger value="device-impact">
              <Cpu className="h-4 w-4 mr-1" />
              Device Impact
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-4 w-4 mr-1" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              <UserPlus className="h-4 w-4 mr-1" />
              Waitlist
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-6 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-primary">{recipientProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Recipients</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-info" />
                <p className="text-3xl font-bold text-info">{donorProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Donors</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Package className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-3xl font-bold text-success">{totalDevices}</p>
                <p className="text-sm text-muted-foreground">Devices</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-3xl font-bold text-accent">${totalCashReceived.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Cash Received</p>
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
                  {activityLogs.length > 0 ? activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p>{log.description}</p>
                        <p className="text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
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

          {/* VERIFICATION TAB */}
          <TabsContent value="verification">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Device Verification Queue
                </h2>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="all">All Donations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {verificationsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pendingVerifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No devices awaiting verification</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingVerifications.map((donation: any) => (
                    <div key={donation.id} className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium capitalize">{donation.device_type}</p>
                          <p className="text-sm text-muted-foreground capitalize">{donation.condition}</p>
                        </div>
                        <Badge className={getStatusColor(donation.status)}>
                          {getStatusLabel(donation.status)}
                        </Badge>
                      </div>
                      
                      {/* Thumbnail preview */}
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        {[donation.media_front_url, donation.media_back_url, donation.media_screen_url, donation.media_serial_url]
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((url, i) => (
                            <div key={i} className="aspect-square rounded overflow-hidden bg-muted">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={donation.donor?.avatar_url} />
                          <AvatarFallback>{donation.donor?.full_name?.charAt(0) || 'D'}</AvatarFallback>
                        </Avatar>
                        <span>{donation.donor?.full_name || 'Unknown'}</span>
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          setSelectedVerification(donation);
                          setIsVerificationModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Device
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                {filteredApplications.length > 0 ? filteredApplications.map(app => (
                  <div key={app.id} className="p-4 border rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{app.profile?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{app.device_needed} • {app.profile?.location || 'Unknown location'}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">{app.purpose}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>References: {app.references?.filter(r => r.is_validated).length || 0}/{app.references?.length || 0} validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedApplication(app); setIsAppDetailOpen(true); }}>
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(app.id)} disabled={updateApplication.isPending}>
                            <Check className="h-4 w-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)} disabled={updateApplication.isPending}>
                            <X className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">No applications found</p>
                )}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
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
                  {filteredDonations.length > 0 ? filteredDonations.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.device_type}</TableCell>
                      <TableCell>{d.donor?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{d.recipient?.full_name || '-'}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                      <TableCell>{formatDate(d.created_at)}</TableCell>
                      <TableCell>
                        {d.status === 'matchable' && (
                          <Button size="sm" onClick={() => { setSelectedDonation(d); setIsMatchModalOpen(true); }}>Match</Button>
                        )}
                        {d.status === 'matched' && (
                          <Button size="sm" variant="outline" onClick={() => handleConfirmDelivery(d.id)} disabled={createAttestation.isPending}>
                            {createAttestation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Delivery'}
                          </Button>
                        )}
                        {d.status === 'delivered' && d.attestation?.[0] && (
                          <span className="text-xs text-muted-foreground font-mono">{d.attestation[0].tx_hash}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No donations found</TableCell>
                    </TableRow>
                  )}
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
                  {attestations.length > 0 ? attestations.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.tx_hash}</TableCell>
                      <TableCell>{log.donation?.device_type || 'Unknown'}</TableCell>
                      <TableCell>{log.donor?.full_name || 'Unknown'} → {log.recipient?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                      <TableCell><Badge variant="outline">{log.network}</Badge></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No attestations yet</TableCell>
                    </TableRow>
                  )}
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
                      {recipientProfiles.length > 0 ? recipientProfiles.map(r => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={r.profile?.avatar_url || ''} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{r.profile?.full_name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{r.creator_type || 'Other'}</TableCell>
                          <TableCell>{r.profile?.location || '-'}, {r.profile?.country || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{r.xp} XP</Badge></TableCell>
                          <TableCell>{r.device_received_id ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}</TableCell>
                          <TableCell>{formatDate(r.created_at)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No recipients found</TableCell>
                        </TableRow>
                      )}
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
                      {donorProfiles.length > 0 ? donorProfiles.map(d => (
                        <TableRow key={d.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={d.profile?.avatar_url || ''} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{d.organization_name || d.profile?.full_name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{d.donor_type}</TableCell>
                          <TableCell>{d.profile?.location || '-'}</TableCell>
                          <TableCell>{d.total_donated}</TableCell>
                          <TableCell>{d.recipients_helped}</TableCell>
                          <TableCell>{formatDate(d.created_at)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No donors found</TableCell>
                        </TableRow>
                      )}
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
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Total applications</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Approval Rate</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">
                  {applications.length > 0 
                    ? Math.round((applications.filter(a => a.status === 'approved').length / applications.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Of all applications</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Devices Donated</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">{donations.length}</p>
                <p className="text-xs text-muted-foreground">Total donations</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Deliveries</span>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <p className="text-2xl font-bold">{donations.filter(d => d.status === 'delivered').length}</p>
                <p className="text-xs text-muted-foreground">Completed deliveries</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ApplicationTrendChart />
              <DeviceTypeChart />
              <CashDonationsTrendChart data={cashDonations} />
              <DonationsByRegionChart />
              <XPGrowthChart />
            </div>
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks">
            <TaskManager />
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
        <DeviceVerificationModal
          open={isVerificationModalOpen}
          onOpenChange={setIsVerificationModalOpen}
          donation={selectedVerification}
        />
      </div>

      {/* DEVICE IMPACT TAB */}
      <TabsContent value="device-impact">
        <DeviceImpactManager />
      </TabsContent>

      {/* WAITLIST TAB */}
      <TabsContent value="waitlist">
        <WaitlistManager />
      </TabsContent>
    </DashboardLayout>
  );
}
