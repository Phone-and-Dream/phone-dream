import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';

export default function DonorRegister() {
  const navigate = useNavigate();
  const [needsRefurbishing, setNeedsRefurbishing] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [otherDeviceType, setOtherDeviceType] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [repairAmount, setRepairAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/donor/dashboard');
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'NGN': return '₦';
      case 'USDC': return '';
      case 'USDT': return '';
      default: return '$';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Donate a Device</h1>
        <p className="text-muted-foreground mb-8">Your device can change someone's life</p>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Name / Organization *</Label>
              <Input placeholder="Name or organization" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location *</Label>
            <Input placeholder="City, Country" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device Type *</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="smartphone">Smartphone</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="pc">Desktop PC</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="keyboard">Keyboard</SelectItem>
                  <SelectItem value="external-storage">External Storage</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used - Good Condition</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {deviceType === 'other' && (
            <div className="space-y-2">
              <Label>Please specify device type *</Label>
              <Input 
                placeholder="e.g., Drawing Tablet, VR Headset, Camera" 
                value={otherDeviceType}
                onChange={(e) => setOtherDeviceType(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-medium">Does it need refurbishing?</p>
              <p className="text-sm text-muted-foreground">If yes, you can contribute to repair costs</p>
            </div>
            <Switch checked={needsRefurbishing} onCheckedChange={setNeedsRefurbishing} />
          </div>

          {needsRefurbishing && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
              <Label>Repair Contribution (Optional)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
                <div className="col-span-2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input 
                    type="number" 
                    placeholder="50" 
                    className="pl-7"
                    value={repairAmount}
                    onChange={(e) => setRepairAmount(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {currency === 'USD' && 'US Dollar'}
                {currency === 'NGN' && 'Nigerian Naira'}
                {currency === 'USDC' && 'USDC Stablecoin (processed via Base network)'}
                {currency === 'USDT' && 'USDT Stablecoin (processed via Base network)'}
              </p>
              {(currency === 'USDC' || currency === 'USDT') && (
                <p className="text-xs text-primary">
                  💎 Crypto payments are processed on the Base blockchain for transparency
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">Submit Donation</Button>
        </form>
      </div>
    </div>
  );
}
