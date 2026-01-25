import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Navbar } from '@/components/layout/Navbar';
import { DeviceMediaUpload, hasAllRequiredMedia } from '@/components/DeviceMediaUpload';
import { useToast } from '@/hooks/use-toast';
import { useSubmitForVerification } from '@/hooks/useDeviceVerification';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, ArrowRight, ArrowLeft, Camera } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import type { Database } from '@/integrations/supabase/types';

type DeviceCondition = Database['public']['Enums']['device_condition'];

type RegistrationStep = 'details' | 'media' | 'review';

export default function DonorRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const submitForVerification = useSubmitForVerification();
  
  const [step, setStep] = useState<RegistrationStep>('details');
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  
  // Device details
  const [needsRefurbishing, setNeedsRefurbishing] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  const [otherDeviceType, setOtherDeviceType] = useState('');
  const [condition, setCondition] = useState<DeviceCondition | ''>('');
  const [deviceSpecs, setDeviceSpecs] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [repairAmount, setRepairAmount] = useState('');
  
  // Draft donation for media upload
  const [draftDonationId, setDraftDonationId] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<{
    front?: string | null;
    back?: string | null;
    screen?: string | null;
    serial?: string | null;
    video?: string | null;
  }>({});
  const [serialImeiText, setSerialImeiText] = useState('');

  // Validation
  const isDeviceTypeValid = deviceType && (deviceType !== 'other' || otherDeviceType.trim().length > 0);
  const isConditionValid = !!condition;
  const isDetailsValid = isDeviceTypeValid && isConditionValid;
  const isMediaComplete = hasAllRequiredMedia(mediaUrls);

  const handleProceedToMedia = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please sign up or log in to donate a device",
        variant: "destructive",
      });
      navigate('/signup?role=donor');
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

    setIsCreatingDraft(true);
    try {
      // Create donation in draft status
      const { data, error } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          device_type: finalDeviceType,
          device_specs: deviceSpecs || null,
          condition,
          needs_refurbishing: needsRefurbishing,
          repair_contribution: repairAmount ? parseFloat(repairAmount) : null,
          currency,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setDraftDonationId(data.id);
      setStep('media');
    } catch (error) {
      toast({
        title: "Error creating donation",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const handleMediaChange = (mediaType: string, url: string | null) => {
    setMediaUrls(prev => ({ ...prev, [mediaType]: url }));
  };

  const handleSubmitForVerification = async () => {
    if (!draftDonationId) return;

    try {
      // Update serial/IMEI text if provided
      if (serialImeiText.trim()) {
        await supabase
          .from('donations')
          .update({ serial_imei_text: serialImeiText.trim() })
          .eq('id', draftDonationId);
      }

      await submitForVerification.mutateAsync(draftDonationId);

      toast({
        title: "Donation submitted!",
        description: "Your device is now awaiting verification. We'll notify you once it's reviewed.",
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {(['details', 'media', 'review'] as const).map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${step === s ? 'bg-primary text-primary-foreground' : 
              (['details', 'media', 'review'].indexOf(step) > i ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}
          `}>
            {i + 1}
          </div>
          {i < 2 && (
            <div className={`w-12 h-0.5 ${['details', 'media', 'review'].indexOf(step) > i ? 'bg-primary/50' : 'bg-muted'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <BackButton to={user ? "/donor/dashboard" : "/"} className="mb-4" />
        <h1 className="text-3xl font-display font-bold mb-2">Donate a Device</h1>
        <p className="text-muted-foreground mb-8">Your device can change someone's life</p>

        {renderStepIndicator()}

        <div className="glass-card rounded-2xl p-6 md:p-8">
          {step === 'details' && (
            <div className="space-y-6">
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
                </div>
              )}

              <Button 
                onClick={handleProceedToMedia}
                className="w-full" 
                size="lg"
                disabled={!isDetailsValid || isCreatingDraft}
              >
                {isCreatingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue to Photos
                    <Camera className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-center text-sm text-muted-foreground">
                  You'll need to sign up to complete your donation
                </p>
              )}
            </div>
          )}

          {step === 'media' && draftDonationId && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Upload Device Photos</h2>
                <p className="text-sm text-muted-foreground">
                  Please upload clear photos of your device from all angles. This helps us verify the device condition.
                </p>
              </div>

              <DeviceMediaUpload
                donationId={draftDonationId}
                mediaUrls={mediaUrls}
                serialImeiText={serialImeiText}
                onMediaChange={handleMediaChange}
                onSerialImeiChange={setSerialImeiText}
              />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('details')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep('review')}
                  className="flex-1"
                  disabled={!isMediaComplete}
                >
                  Review Donation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Review Your Donation</h2>
                <p className="text-sm text-muted-foreground">
                  Please confirm the details below before submitting.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h3 className="font-medium mb-3">Device Details</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium capitalize">{deviceType === 'other' ? otherDeviceType : deviceType}</dd>
                    </div>
                    {deviceSpecs && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Specifications</dt>
                        <dd className="font-medium">{deviceSpecs}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Condition</dt>
                      <dd className="font-medium capitalize">{condition}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Needs Refurbishing</dt>
                      <dd className="font-medium">{needsRefurbishing ? 'Yes' : 'No'}</dd>
                    </div>
                    {repairAmount && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Repair Contribution</dt>
                        <dd className="font-medium">{getCurrencySymbol(currency)}{repairAmount} {currency}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">2 device photos uploaded</span>
                  </div>
                  {serialImeiText && (
                    <p className="text-sm text-muted-foreground mt-1">Serial/IMEI: {serialImeiText}</p>
                  )}
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm">
                    <strong>Next Steps:</strong> After submission, our team will verify your device photos (usually within 24 hours). 
                    Once verified, your device will be matched with a recipient in need.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('media')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitForVerification}
                  className="flex-1"
                  disabled={submitForVerification.isPending}
                >
                  {submitForVerification.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
