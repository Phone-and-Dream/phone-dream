import { useState } from 'react';
import { Edit2, Plus, Search, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useXPRules, useUpdateXPRule, useCreateXPTransaction, useXPTransactions, useAllRecipientProfiles } from '@/hooks/useAdminData';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type XPRule = Database['public']['Tables']['xp_rules']['Row'];

const rankThresholds = [
  { rank: 'Bronze', minXP: 0, maxXP: 499, icon: '🥉' },
  { rank: 'Silver', minXP: 500, maxXP: 1999, icon: '🥈' },
  { rank: 'Gold', minXP: 2000, maxXP: 4999, icon: '🥇' },
  { rank: 'Platinum', minXP: 5000, maxXP: null, icon: '💎' },
];

export function XPRulesManager() {
  const { data: rules = [], isLoading: rulesLoading } = useXPRules();
  const { data: transactions = [], isLoading: transactionsLoading } = useXPTransactions();
  const { data: recipientProfiles = [] } = useAllRecipientProfiles();
  const updateXPRule = useUpdateXPRule();
  const createXPTransaction = useCreateXPTransaction();

  const [editingRule, setEditingRule] = useState<XPRule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Manual adjustment state
  const [searchRecipient, setSearchRecipient] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isPositive, setIsPositive] = useState(true);

  const filteredRecipients = recipientProfiles.filter(r =>
    r.profile?.full_name?.toLowerCase().includes(searchRecipient.toLowerCase())
  );

  const handleEditRule = (rule: XPRule) => {
    setEditingRule({ ...rule });
    setIsEditModalOpen(true);
  };

  const handleSaveRule = async () => {
    if (editingRule) {
      try {
        await updateXPRule.mutateAsync({
          id: editingRule.id,
          xp_value: editingRule.xp_value,
          description: editingRule.description,
          is_active: editingRule.is_active,
        });
        setIsEditModalOpen(false);
        toast({
          title: 'Rule Updated',
          description: `${editingRule.action} now awards ${editingRule.xp_value} XP`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update rule',
          variant: 'destructive',
        });
      }
    }
  };

  const handleApplyAdjustment = async () => {
    if (!selectedRecipient || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const recipient = recipientProfiles.find(r => r.user_id === selectedRecipient);
    if (!recipient) return;

    const amount = isPositive ? parseInt(adjustmentAmount) : -parseInt(adjustmentAmount);
    
    try {
      await createXPTransaction.mutateAsync({
        recipient_id: selectedRecipient,
        amount,
        description: adjustmentReason,
      });

      setSearchRecipient('');
      setSelectedRecipient(null);
      setAdjustmentAmount('');
      setAdjustmentReason('');

      toast({
        title: 'XP Adjusted',
        description: `${amount > 0 ? '+' : ''}${amount} XP applied to ${recipient.profile?.full_name || 'recipient'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply XP adjustment',
        variant: 'destructive',
      });
    }
  };

  if (rulesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Rules Table */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">XP Rules Configuration</h2>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>XP Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length > 0 ? rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.action}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    +{rule.xp_value} XP
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{rule.description}</TableCell>
                <TableCell>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => handleEditRule(rule)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No XP rules configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rank Thresholds */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Rank Thresholds</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {rankThresholds.map((rank) => (
            <div key={rank.rank} className="border rounded-lg p-4 text-center">
              <span className="text-3xl mb-2 block">{rank.icon}</span>
              <p className="font-semibold">{rank.rank}</p>
              <p className="text-sm text-muted-foreground">
                {rank.minXP} - {rank.maxXP || '∞'} XP
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual XP Adjustment */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Manual XP Adjustment</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Recipient</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchRecipient && (
                <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                  {filteredRecipients.length > 0 ? filteredRecipients.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecipient(r.user_id);
                        setSearchRecipient(r.profile?.full_name || 'Unknown');
                      }}
                      className={`p-2 cursor-pointer hover:bg-muted ${
                        selectedRecipient === r.user_id ? 'bg-primary/10' : ''
                      }`}
                    >
                      {r.profile?.full_name || 'Unknown'} - {r.xp} XP
                    </div>
                  )) : (
                    <div className="p-2 text-muted-foreground text-sm">No recipients found</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isPositive ? 'default' : 'outline'}
                onClick={() => setIsPositive(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                variant={!isPositive ? 'destructive' : 'outline'}
                onClick={() => setIsPositive(false)}
              >
                <Minus className="h-4 w-4 mr-1" />
                Subtract
              </Button>
              <Input
                type="number"
                placeholder="Amount"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-24"
              />
              <span className="self-center text-muted-foreground">XP</span>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                placeholder="Reason for adjustment..."
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleApplyAdjustment} className="w-full" disabled={createXPTransaction.isPending}>
              {createXPTransaction.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply Adjustment
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Recent Adjustments</label>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : transactions.length > 0 ? transactions.map((adj) => (
                <div key={adj.id} className="p-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Transaction</span>
                    <Badge variant={adj.amount > 0 ? 'default' : 'destructive'}>
                      {adj.amount > 0 ? '+' : ''}{adj.amount} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{adj.description || 'No reason provided'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(adj.created_at).toLocaleDateString()}
                  </p>
                </div>
              )) : (
                <div className="p-3 text-sm text-muted-foreground">No recent adjustments</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Rule Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit XP Rule</DialogTitle>
            <DialogDescription>Modify the XP value for this action</DialogDescription>
          </DialogHeader>
          {editingRule && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Action</label>
                <Input value={editingRule.action} disabled className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">XP Value</label>
                <Input
                  type="number"
                  value={editingRule.xp_value}
                  onChange={(e) => setEditingRule({ ...editingRule, xp_value: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, is_active: checked })}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveRule} disabled={updateXPRule.isPending}>
                  {updateXPRule.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
