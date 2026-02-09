// Admin Device Impact Manager - handles device lifecycle for SBT minting
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Plus, 
  Laptop, 
  Smartphone, 
  Check, 
  Users, 
  Award,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface Device {
  id: string;
  device_type: string;
  condition: string;
  funding_type: 'physical_device' | 'impact_pool';
  donation_id: string | null;
  assigned_recipient_id: string | null;
  recipient_career_at_assignment: string | null;
  handover_date: string | null;
  admin_confirmed: boolean;
  minting_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface RecipientOption {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  career: string | null;
}

export function DeviceImpactManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Fetch devices
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['admin-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Device[];
    },
  });

  // Fetch approved recipients for assignment
  const { data: recipients = [] } = useQuery({
    queryKey: ['approved-recipients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipient_profiles')
        .select('user_id, career, profiles!inner(id, full_name, avatar_url)')
        .eq('is_verified', true);
      
      if (error) throw error;
      
      return data.map(r => ({
        id: r.user_id,
        full_name: (r.profiles as any)?.full_name,
        avatar_url: (r.profiles as any)?.avatar_url,
        career: r.career,
      })) as RecipientOption[];
    },
  });

  // Create device mutation
  const createDevice = useMutation({
    mutationFn: async (data: { device_type: string; condition: 'new' | 'used' | 'refurbished'; funding_type: 'physical_device' | 'impact_pool' }) => {
      const { error } = await supabase.from('devices').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
      toast({ title: 'Device Created', description: 'Device record has been created.' });
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update device mutation
  const updateDevice = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; assigned_recipient_id?: string; recipient_career_at_assignment?: string; admin_confirmed?: boolean; handover_date?: string; minting_enabled?: boolean }) => {
      const { error } = await supabase
        .from('devices')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
      toast({ title: 'Device Updated', description: 'Device record has been updated.' });
      setIsAssignModalOpen(false);
      setSelectedDevice(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Filter devices
  const filteredDevices = devices.filter(d => {
    if (filter === 'pending') return !d.assigned_recipient_id;
    if (filter === 'assigned') return d.assigned_recipient_id && !d.admin_confirmed;
    if (filter === 'confirmed') return d.admin_confirmed && !d.minting_enabled;
    if (filter === 'minting') return d.minting_enabled;
    return true;
  }).filter(d => 
    !searchTerm || 
    d.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (device: Device) => {
    if (device.minting_enabled) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Minting Enabled</Badge>;
    }
    if (device.admin_confirmed) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Delivered</Badge>;
    }
    if (device.assigned_recipient_id) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Assigned</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const handleAssignRecipient = (device: Device) => {
    setSelectedDevice(device);
    setIsAssignModalOpen(true);
  };

  const handleConfirmDelivery = async (device: Device) => {
    await updateDevice.mutateAsync({
      id: device.id,
      admin_confirmed: true,
      handover_date: new Date().toISOString(),
    });
  };

  const handleEnableMinting = async (device: Device) => {
    await updateDevice.mutateAsync({
      id: device.id,
      minting_enabled: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="pending">Pending Assignment</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="confirmed">Delivered</SelectItem>
              <SelectItem value="minting">Minting Enabled</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{devices.length}</p>
          <p className="text-sm text-muted-foreground">Total Devices</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {devices.filter(d => !d.assigned_recipient_id).length}
          </p>
          <p className="text-sm text-muted-foreground">Pending Assignment</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {devices.filter(d => d.admin_confirmed).length}
          </p>
          <p className="text-sm text-muted-foreground">Delivered</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {devices.filter(d => d.minting_enabled).length}
          </p>
          <p className="text-sm text-muted-foreground">Minting Enabled</p>
        </div>
      </div>

      {/* Devices Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Funding Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No devices found
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {device.device_type.toLowerCase().includes('phone') ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Laptop className="h-4 w-4" />
                      )}
                      <div>
                        <p className="font-medium">{device.device_type}</p>
                        <p className="text-xs text-muted-foreground">{device.condition}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {device.funding_type === 'impact_pool' ? 'Impact Pool' : 'Physical'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {device.assigned_recipient_id ? (
                      <div className="text-sm">
                        <p>{device.recipient_career_at_assignment || 'Assigned'}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.handover_date && format(new Date(device.handover_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(device)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(device.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!device.assigned_recipient_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignRecipient(device)}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      )}
                      {device.assigned_recipient_id && !device.admin_confirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmDelivery(device)}
                          disabled={updateDevice.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirm Delivery
                        </Button>
                      )}
                      {device.admin_confirmed && !device.minting_enabled && (
                        <Button
                          size="sm"
                          onClick={() => handleEnableMinting(device)}
                          disabled={updateDevice.isPending}
                        >
                          <Award className="h-3 w-3 mr-1" />
                          Enable Minting
                        </Button>
                      )}
                      {device.minting_enabled && (
                        <Badge className="bg-green-500/10 text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Device Modal */}
      <CreateDeviceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={(data) => createDevice.mutate(data)}
        isLoading={createDevice.isPending}
      />

      {/* Assign Recipient Modal */}
      <AssignRecipientModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        device={selectedDevice}
        recipients={recipients}
        onSubmit={(recipientId, career) => {
          if (selectedDevice) {
            updateDevice.mutate({
              id: selectedDevice.id,
              assigned_recipient_id: recipientId,
              recipient_career_at_assignment: career,
            });
          }
        }}
        isLoading={updateDevice.isPending}
      />
    </div>
  );
}

// Create Device Modal
function CreateDeviceModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { device_type: string; condition: 'new' | 'used' | 'refurbished'; funding_type: 'physical_device' | 'impact_pool' }) => void;
  isLoading: boolean;
}) {
  const [deviceType, setDeviceType] = useState('Laptop');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [fundingType, setFundingType] = useState<'physical_device' | 'impact_pool'>('physical_device');

  const handleSubmit = () => {
    onSubmit({
      device_type: deviceType,
      condition,
      funding_type: fundingType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Create a new device record for Impact Badge tracking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Device Type</Label>
            <Select value={deviceType} onValueChange={setDeviceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Funding Type</Label>
            <Select value={fundingType} onValueChange={(v) => setFundingType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical_device">Physical Device (Direct Donation)</SelectItem>
                <SelectItem value="impact_pool">Impact Pool (Community Funded)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Assign Recipient Modal
function AssignRecipientModal({
  open,
  onOpenChange,
  device,
  recipients,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  recipients: RecipientOption[];
  onSubmit: (recipientId: string, career: string) => void;
  isLoading: boolean;
}) {
  const [selectedRecipient, setSelectedRecipient] = useState('');

  const recipient = recipients.find(r => r.id === selectedRecipient);

  const handleSubmit = () => {
    if (selectedRecipient && recipient) {
      onSubmit(selectedRecipient, recipient.career || 'Unknown');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Recipient</DialogTitle>
          <DialogDescription>
            Link this device to a verified recipient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Device</Label>
            <p className="text-sm font-medium">{device?.device_type} ({device?.condition})</p>
          </div>

          <div>
            <Label>Select Recipient</Label>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a recipient..." />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={r.avatar_url || ''} />
                        <AvatarFallback>{r.full_name?.[0] || 'R'}</AvatarFallback>
                      </Avatar>
                      <span>{r.full_name || 'Unnamed'}</span>
                      {r.career && (
                        <span className="text-muted-foreground text-xs">• {r.career}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {recipient && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={recipient.avatar_url || ''} />
                  <AvatarFallback>{recipient.full_name?.[0] || 'R'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{recipient.full_name}</p>
                  <p className="text-sm text-muted-foreground">{recipient.career || 'No career specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedRecipient || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign Recipient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
