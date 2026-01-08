import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateDonation } from '@/hooks/useDonations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DeviceCondition = Database['public']['Enums']['device_condition'];

export default function DonorRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createDonation = useCreateDonation();
  
  const [needsRefurbishing, setNeedsRefurbishing] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [otherDeviceType, setOtherDeviceType] = useState('');
  const [condition, setCondition] = useState<DeviceCondition | ''>('');
  const [deviceSpecs, setDeviceSpecs] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [repairAmount, setRepairAmount] = useState('');

  // Validation
  const isDeviceTypeValid = deviceType && (deviceType !== 'other' || otherDeviceType.trim().length > 0);
  const isConditionValid = !!condition;
  const isFormValid = isDeviceTypeValid && isConditionValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please sign up or log in to donate a device",
        variant: "destructive",
      });
      navigate('/signup');
      return;
    }

    const finalDeviceType = deviceType === 'other' ? otherDeviceType : deviceType;

    if (!finalDeviceType || !condition) {
      toast({
        title: "Missing required fields",
        description: "Please select device type and condition",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDonation.mutateAsync({
        device_type: finalDeviceType,
        device_specs: deviceSpecs || null,
        condition,
        needs_refurbishing: needsRefurbishing,
        repair_contribution: repairAmount ? parseFloat(repairAmount) : null,
        currency,
      });

      toast({
        title: "Donation submitted!",
        description: "Thank you for your generosity. We'll be in touch soon.",
      });

      navigate('/donor/dashboard');
    } catch (error) {
      toast({
        title: "Error submitting donation",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
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
              <Label className="flex items-center gap-2">
                Device Type *
                {isDeviceTypeValid && <Check className="h-4 w-4 text-accent" />}
              </Label>
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
              <Label className="flex items-center gap-2">
                Condition *
                {isConditionValid && <Check className="h-4 w-4 text-accent" />}
              </Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as DeviceCondition)}>
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
              {deviceType === 'other' && !otherDeviceType.trim() && (
                <p className="text-xs text-destructive">Please specify the device type</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Device Specifications (Optional)</Label>
            <Input 
              placeholder="e.g., MacBook Pro 2019, 16GB RAM, 512GB SSD" 
              value={deviceSpecs}
              onChange={(e) => setDeviceSpecs(e.target.value)}
            />
          </div>

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

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!isFormValid || createDonation.isPending}
          >
            {createDonation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : !isFormValid ? (
              'Complete required fields'
            ) : (
              'Submit Donation'
            )}
          </Button>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              You'll need to sign up to complete your donation
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
