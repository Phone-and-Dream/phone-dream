import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Mail, Search, Filter, Users, Gift, Loader2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type DonorWaitlistEntry = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  country: string;
  donor_type: string;
  organization_name: string | null;
  organization_role: string | null;
  devices_interested: string[];
  donation_timing: string | null;
  estimated_devices: string | null;
  support_reason: string | null;
};

type RecipientWaitlistEntry = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  country: string;
  state: string;
  age_range: string;
  current_status: string;
  current_status_other: string | null;
  learning_interest: string;
  learning_interest_other: string | null;
  device_usage_plan: string;
  device_needed: string[];
  current_device_status: string;
};

function useDonorWaitlist() {
  return useQuery({
    queryKey: ['donor-waitlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donor_waitlist')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DonorWaitlistEntry[];
    },
  });
}

function useRecipientWaitlist() {
  return useQuery({
    queryKey: ['recipient-waitlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipient_waitlist')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RecipientWaitlistEntry[];
    },
  });
}

function useDeleteWaitlistEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ table, id }: { table: 'donor_waitlist' | 'recipient_waitlist'; id: string }) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { table }) => {
      queryClient.invalidateQueries({ queryKey: [table === 'donor_waitlist' ? 'donor-waitlist' : 'recipient-waitlist'] });
      toast({ title: 'Entry deleted', description: 'Waitlist entry has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete entry.', variant: 'destructive' });
    },
  });
}

export function WaitlistManager() {
  const [activeTab, setActiveTab] = useState<'donors' | 'recipients'>('donors');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');

  const { data: donorEntries = [], isLoading: donorLoading } = useDonorWaitlist();
  const { data: recipientEntries = [], isLoading: recipientLoading } = useRecipientWaitlist();
  const deleteEntry = useDeleteWaitlistEntry();

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  // Get unique countries for filtering
  const donorCountries = [...new Set(donorEntries.map(e => e.country))].sort();
  const recipientCountries = [...new Set(recipientEntries.map(e => e.country))].sort();

  // Filter entries
  const filteredDonors = donorEntries.filter(entry => {
    const matchesSearch = 
      entry.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || entry.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const filteredRecipients = recipientEntries.filter(entry => {
    const matchesSearch = 
      entry.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || entry.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const handleExportCSV = (type: 'donors' | 'recipients') => {
    const entries = type === 'donors' ? filteredDonors : filteredRecipients;
    if (entries.length === 0) {
      toast({ title: 'No data', description: 'No entries to export.', variant: 'destructive' });
      return;
    }

    const headers = Object.keys(entries[0]).join(',');
    const rows = entries.map(entry => 
      Object.values(entry).map(v => 
        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : 
        Array.isArray(v) ? `"${v.join(', ')}"` : v
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Exported', description: `${entries.length} entries exported to CSV.` });
  };

  const isLoading = donorLoading || recipientLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Gift className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{donorEntries.length}</p>
          <p className="text-sm text-muted-foreground">Donor Signups</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="h-6 w-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold">{recipientEntries.length}</p>
          <p className="text-sm text-muted-foreground">Recipient Signups</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{donorCountries.length}</p>
          <p className="text-sm text-muted-foreground">Donor Countries</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{recipientCountries.length}</p>
          <p className="text-sm text-muted-foreground">Recipient Countries</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'donors' | 'recipients'); setCountryFilter('all'); }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="donors" className="gap-2">
              <Gift className="h-4 w-4" />
              Donors ({donorEntries.length})
            </TabsTrigger>
            <TabsTrigger value="recipients" className="gap-2">
              <Users className="h-4 w-4" />
              Recipients ({recipientEntries.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {(activeTab === 'donors' ? donorCountries : recipientCountries).map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(activeTab)}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Donors Tab */}
        <TabsContent value="donors" className="mt-0">
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No donor waitlist entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonors.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.full_name}
                        {entry.organization_name && (
                          <span className="block text-xs text-muted-foreground">{entry.organization_name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${entry.email}`} className="text-primary hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {entry.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{entry.donor_type}</Badge>
                      </TableCell>
                      <TableCell>{entry.country}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.devices_interested.slice(0, 2).map((device, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{device}</Badge>
                          ))}
                          {entry.devices_interested.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{entry.devices_interested.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.donation_timing || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete waitlist entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {entry.full_name} from the donor waitlist.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteEntry.mutate({ table: 'donor_waitlist', id: entry.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="mt-0">
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Devices Needed</TableHead>
                  <TableHead>Signed Up</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No recipient waitlist entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecipients.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.full_name}</TableCell>
                      <TableCell>
                        <a href={`mailto:${entry.email}`} className="text-primary hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {entry.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {entry.state}, {entry.country}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.age_range}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.current_status === 'other' ? entry.current_status_other : entry.current_status}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.device_needed.slice(0, 2).map((device, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{device}</Badge>
                          ))}
                          {entry.device_needed.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{entry.device_needed.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete waitlist entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove {entry.full_name} from the recipient waitlist.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteEntry.mutate({ table: 'recipient_waitlist', id: entry.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
