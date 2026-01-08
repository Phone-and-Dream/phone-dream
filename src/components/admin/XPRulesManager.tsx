import { useState } from 'react';
import { Edit2, Plus, Search, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  mockXPRules,
  mockRankThresholds,
  mockXPAdjustments,
  mockRecipients,
  type XPRule,
  type XPAdjustment,
} from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export function XPRulesManager() {
  const [rules, setRules] = useState(mockXPRules);
  const [adjustments, setAdjustments] = useState(mockXPAdjustments);
  const [editingRule, setEditingRule] = useState<XPRule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Manual adjustment state
  const [searchRecipient, setSearchRecipient] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isPositive, setIsPositive] = useState(true);

  const filteredRecipients = mockRecipients.filter(r =>
    r.name.toLowerCase().includes(searchRecipient.toLowerCase())
  );

  const handleEditRule = (rule: XPRule) => {
    setEditingRule({ ...rule });
    setIsEditModalOpen(true);
  };

  const handleSaveRule = () => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
      setIsEditModalOpen(false);
      toast({
        title: 'Rule Updated',
        description: `${editingRule.action} now awards ${editingRule.xpValue} XP`,
      });
    }
  };

  const handleApplyAdjustment = () => {
    if (!selectedRecipient || !adjustmentAmount || !adjustmentReason) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const recipient = mockRecipients.find(r => r.id === selectedRecipient);
    if (!recipient) return;

    const amount = isPositive ? parseInt(adjustmentAmount) : -parseInt(adjustmentAmount);
    const newAdjustment: XPAdjustment = {
      id: `adj${adjustments.length + 1}`,
      recipientId: selectedRecipient,
      recipientName: recipient.name,
      amount,
      reason: adjustmentReason,
      adminName: 'Admin',
      date: new Date().toISOString().split('T')[0],
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setSearchRecipient('');
    setSelectedRecipient(null);
    setAdjustmentAmount('');
    setAdjustmentReason('');

    toast({
      title: 'XP Adjusted',
      description: `${amount > 0 ? '+' : ''}${amount} XP applied to ${recipient.name}`,
    });
  };

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
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.action}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    +{rule.xpValue} XP
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{rule.description}</TableCell>
                <TableCell>
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => handleEditRule(rule)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rank Thresholds */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold mb-4">Rank Thresholds</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {mockRankThresholds.map((rank) => (
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
                  {filteredRecipients.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecipient(r.id);
                        setSearchRecipient(r.name);
                      }}
                      className={`p-2 cursor-pointer hover:bg-muted ${
                        selectedRecipient === r.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      {r.name} - {r.xp} XP
                    </div>
                  ))}
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

            <Button onClick={handleApplyAdjustment} className="w-full">
              Apply Adjustment
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Recent Adjustments</label>
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {adjustments.map((adj) => (
                <div key={adj.id} className="p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{adj.recipientName}</span>
                    <Badge variant={adj.amount > 0 ? 'default' : 'destructive'}>
                      {adj.amount > 0 ? '+' : ''}{adj.amount} XP
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{adj.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">{adj.date}</p>
                </div>
              ))}
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
                  value={editingRule.xpValue}
                  onChange={(e) => setEditingRule({ ...editingRule, xpValue: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveRule}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
