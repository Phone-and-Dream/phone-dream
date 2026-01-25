import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Heart, Users, ArrowLeft, ArrowRight, Check, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type AllocationMethod = 'platform' | 'specific_recipient' | 'specific_dream';

interface Recipient {
  id: string;
  name: string;
  tagline?: string;
  avatar_url?: string;
}

interface DreamRequest {
  id: string;
  device_needed: string;
  purpose: string;
  recipient_id: string;
  recipient_name?: string;
}

interface CashDonationFlowProps {
  preSelectedRecipient?: Recipient | null;
  preSelectedDream?: DreamRequest | null;
  onClose?: () => void;
}

type Step = 'amount' | 'allocation' | 'payment' | 'confirmation';

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function CashDonationFlow({ preSelectedRecipient, preSelectedDream, onClose }: CashDonationFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('amount');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [allocationMethod, setAllocationMethod] = useState<AllocationMethod>(
    preSelectedDream ? 'specific_dream' : preSelectedRecipient ? 'specific_recipient' : 'platform'
  );
  const [purpose, setPurpose] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(
    preSelectedRecipient?.id || null
  );
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(
    preSelectedDream?.id || null
  );

  const steps: Step[] = ['amount', 'allocation', 'payment', 'confirmation'];

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount;
  const isAmountValid = effectiveAmount >= 5;

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'NGN': return '₦';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const handlePresetAmount = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setAmount(0);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a donation.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create cash donation record
      const { data, error } = await supabase
        .from('cash_donations')
        .insert({
          donor_id: user.id,
          amount: effectiveAmount,
          currency,
          allocation_method: allocationMethod,
          purpose: purpose || null,
          linked_recipient_id: selectedRecipientId,
          linked_dream_request_id: selectedDreamId,
          status: 'pending', // Will be updated after payment processing
        })
        .select()
        .single();

      if (error) throw error;

      // For now, show success with placeholder for Stripe integration
      toast({
        title: "Donation recorded!",
        description: "Payment processing will be enabled soon. Thank you for your generosity!",
      });

      setStep('confirmation');
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: "Error",
        description: "Failed to create donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
            step === s ? 'bg-primary text-primary-foreground' : 
              (steps.indexOf(step) > i ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')
          )}>
            {steps.indexOf(step) > i ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              "w-8 h-0.5",
              steps.indexOf(step) > i ? 'bg-primary/50' : 'bg-muted'
            )} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {step === 'amount' && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-display font-semibold mb-2">Choose Your Donation Amount</h2>
            <p className="text-muted-foreground">Every contribution helps bridge the digital divide</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === preset && !customAmount ? "default" : "outline"}
                  onClick={() => handlePresetAmount(preset)}
                  className="h-14 text-lg font-semibold"
                >
                  {getCurrencySymbol(currency)}{preset}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Or enter custom amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                  {getCurrencySymbol(currency)}
                </span>
                <Input
                  type="number"
                  placeholder="Other amount"
                  className="pl-8 text-lg h-12"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  min={5}
                />
              </div>
              {customAmount && parseFloat(customAmount) < 5 && (
                <p className="text-xs text-destructive">Minimum donation is {getCurrencySymbol(currency)}5</p>
              )}
            </div>
          </div>

          <Button
            onClick={() => setStep('allocation')}
            className="w-full"
            size="lg"
            disabled={!isAmountValid}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 'allocation' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-display font-semibold mb-2">How Should We Use Your Donation?</h2>
            <p className="text-muted-foreground">Choose how your {getCurrencySymbol(currency)}{effectiveAmount} will make an impact</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                allocationMethod === 'platform'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => {
                setAllocationMethod('platform');
                setSelectedRecipientId(null);
                setSelectedDreamId(null);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  allocationMethod === 'platform' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Let the Platform Decide</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll allocate your donation where it's needed most - device repairs, shipping costs, or operational expenses.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                allocationMethod === 'specific_dream'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setAllocationMethod('specific_dream')}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  allocationMethod === 'specific_dream' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Support a Specific Dream</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse the Dream Board and fund a specific device request or repair cost.
                  </p>
                </div>
              </div>
            </button>

            {preSelectedRecipient && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm">
                  <span className="font-medium">Pre-selected:</span> Supporting {preSelectedRecipient.name}
                </p>
              </div>
            )}

            {preSelectedDream && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm">
                  <span className="font-medium">Supporting dream:</span> {preSelectedDream.device_needed} request
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Add a message (optional)</Label>
            <Textarea
              placeholder="Share why you're donating or leave an encouraging message..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('amount')}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep('payment')}
              className="flex-1"
            >
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-display font-semibold mb-2">Complete Your Donation</h2>
            <p className="text-muted-foreground">Secure payment powered by Stripe</p>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground">Donation Amount</span>
              <span className="text-2xl font-bold">{getCurrencySymbol(currency)}{effectiveAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Allocation</span>
              <span className="font-medium">
                {allocationMethod === 'platform' ? 'Platform decides' : 
                 allocationMethod === 'specific_dream' ? 'Specific dream' : 'Specific recipient'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Payment Coming Soon</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Stripe payment integration is being set up. Your donation intent will be recorded 
                  and you'll be notified when payments are live.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Stripe payment form will appear here</span>
            </div>
            <div className="h-24 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
              <span className="text-sm text-muted-foreground">Payment form placeholder</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('allocation')}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Record Donation Intent
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground">
              Your donation intent of {getCurrencySymbol(currency)}{effectiveAmount} has been recorded.
            </p>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="text-sm">
              We'll notify you when our payment system is live so you can complete your donation.
              Your generosity will help someone achieve their dreams!
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dream-board')}
              className="flex-1"
            >
              Browse Dream Board
            </Button>
            <Button
              onClick={() => navigate('/donor/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
