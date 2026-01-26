import { useState, useEffect } from 'react';
import { X, Heart, ArrowRight, Check, ExternalLink, DollarSign, Camera, Loader2, Shield, ChevronDown, ChevronUp, MapPin, GraduationCap, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { RankBadge } from '@/components/ui/rank-badge';
import { NFTBadge } from '@/components/NFTBadge';
import { DeviceMediaUpload, hasAllRequiredMedia } from '@/components/DeviceMediaUpload';
import { CashDonationFlow } from '@/components/CashDonationFlow';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateDonation } from '@/hooks/useDonations';
import { useSubmitForVerification } from '@/hooks/useDeviceVerification';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { sanitizeStory, truncateToWords } from '@/lib/sanitize';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DreamRequestWithDetails = Database['public']['Tables']['dream_requests']['Row'] & {
  recipient?: Database['public']['Tables']['profiles']['Row'] | null;
  recipient_profile?: Database['public']['Tables']['recipient_profiles']['Row'] | null;
};

interface DonationModalProps {
  request: DreamRequestWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

type DonationStep = 'overview' | 'choice' | 'form' | 'media' | 'confirm' | 'success' | 'cash';

export function DonationModal({ request, isOpen, onClose }: DonationModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createDonation = useCreateDonation();
  const submitForVerification = useSubmitForVerification();
  
  const [step, setStep] = useState<DonationStep>('overview');
  const [deviceType, setDeviceType] = useState('');
  const [otherDeviceType, setOtherDeviceType] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [deviceSpecs, setDeviceSpecs] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [repairContribution, setRepairContribution] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  
  // Draft donation state for media upload
  const [draftDonationId, setDraftDonationId] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<{
    front?: string | null;
    back?: string | null;
    screen?: string | null;
    serial?: string | null;
    video?: string | null;
  }>({});
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  // Pre-fill device type from dream request
  useEffect(() => {
    if (request?.device_needed) {
      const deviceLower = request.device_needed.toLowerCase();
      if (deviceLower.includes('laptop')) setDeviceType('laptop');
      else if (deviceLower.includes('phone') || deviceLower.includes('smartphone')) setDeviceType('smartphone');
      else if (deviceLower.includes('tablet')) setDeviceType('tablet');
      else if (deviceLower.includes('desktop') || deviceLower.includes('pc')) setDeviceType('pc');
      else {
        setDeviceType('other');
        setOtherDeviceType(request.device_needed);
      }
    }
  }, [request]);

  const handleClose = () => {
    setStep('overview');
    setDeviceType('');
    setOtherDeviceType('');
    setCondition('used');
    setDeviceSpecs('');
    setCurrency('USD');
    setRepairContribution('');
    setDraftDonationId(null);
    setMediaUrls({});
    onClose();
  };

  // Create draft donation and move to media step
  const handleProceedToMedia = async () => {
    if (!user) {
      toast({ 
        title: "Please sign in", 
        description: "You need to be logged in as a donor to make a donation.",
        variant: "destructive"
      });
      navigate('/signup?role=donor');
      return;
    }

    setIsCreatingDraft(true);
    try {
      const finalDeviceType = deviceType === 'other' ? otherDeviceType : deviceType;
      
      // Create donation in draft status - donor has already chosen this recipient
      const { data, error } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          device_type: finalDeviceType,
          device_specs: deviceSpecs || null,
          condition: condition,
          needs_refurbishing: request?.needs_refurbishing || false,
          repair_contribution: repairContribution ? parseFloat(repairContribution) : null,
          currency: currency,
          status: 'draft',
          linked_dream_request_id: request?.id || null,
          recipient_selection_method: 'donor_choice',
          pre_selected_recipient_id: request?.recipient_id || null,
        })
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Failed to create donation - no data returned');

      setDraftDonationId(data.id);
      setStep('media');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create donation draft. Please try again.",
        variant: "destructive"
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
      await submitForVerification.mutateAsync(draftDonationId);
      setStep('success');
      toast({ title: "Donation submitted!", description: "Your device is now awaiting verification." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to submit for verification. Please try again.",
        variant: "destructive"
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

  const getCurrencyLabel = (curr: string) => {
    switch (curr) {
      case 'NGN': return 'Nigerian Naira';
      case 'USDC': return 'USDC (Stablecoin)';
      case 'USDT': return 'USDT (Stablecoin)';
      default: return 'US Dollar';
    }
  };

  const getMilestones = (request: DreamRequestWithDetails): string[] => {
    const milestones = request.milestones as { items?: string[] } | string[] | null;
    if (Array.isArray(milestones)) return milestones;
    if (milestones && Array.isArray(milestones.items)) return milestones.items;
    return ['Complete online courses', 'Build portfolio projects', 'Start freelancing'];
  };

  if (!request) return null;

  const recipientName = request.recipient?.full_name || 'Anonymous';
  const recipientAvatar = request.recipient?.avatar_url || 'https://via.placeholder.com/64';
  const creatorType = request.recipient_profile?.creator_type || 'Creator';
  const recipientLocation = [request.recipient?.location, request.recipient?.country].filter(Boolean).join(', ') || 'Unknown';
  const rank = request.recipient_profile?.rank || 'Bronze';
  const institution = request.recipient_profile?.institution;
  const schoolOrCareer = request.recipient_profile?.school_or_career;

  // Sanitize story
  const sanitizedPurpose = sanitizeStory(request.purpose || '');
  const { truncated: truncatedStory, isTruncated: hasMoreStory } = truncateToWords(sanitizedPurpose, 50);

  const isMediaComplete = hasAllRequiredMedia(mediaUrls);
  const isDeviceTypeValid = deviceType && (deviceType !== 'other' || otherDeviceType.trim().length > 0);

  const renderStep = () => {
    switch (step) {
      case 'overview':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Support {recipientName}'s Dream
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Recipient Summary */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                <img 
                  src={recipientAvatar} 
                  alt={recipientName} 
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{recipientName}</h3>
                    <RankBadge rank={rank} size="sm" />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      <span className="capitalize">{schoolOrCareer || creatorType}</span>
                      {institution && <span>at {institution}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{recipientLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Needed */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Device Needed</p>
                <p className="text-xl font-bold text-primary">{request.device_needed}</p>
                {request.needs_refurbishing && (
                  <p className="text-xs text-amber-600 mt-1">✨ Open to refurbished devices</p>
                )}
              </div>

              {/* Background Story - Sanitized */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Background Story</p>
                <p className="text-sm">
                  {isStoryExpanded ? sanitizedPurpose : truncatedStory}
                </p>
                {hasMoreStory && (
                  <button 
                    type="button"
                    onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                    className="text-sm text-primary hover:underline mt-1 flex items-center gap-1"
                  >
                    {isStoryExpanded ? (
                      <>Show less <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>Read more <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </div>

              {/* Milestones */}
              {getMilestones(request).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What They'll Achieve</p>
                  <ul className="space-y-1">
                    {getMilestones(request).map((milestone, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Notice */}
              <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  For safety and fairness, personal contact details are not shared. All verification, matching, and delivery are handled by A Phone and A Dream.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/recipient/profile/${request.recipient_id}`} target="_blank">
                    View Full Profile
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
                <Button className="flex-1" onClick={() => setStep('choice')}>
                  <Heart className="h-4 w-4 mr-2" />
                  Donate to this recipient
                </Button>
              </div>
            </div>
          </>
        );

      case 'choice':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                How would you like to support {recipientName}?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Device Donation Card */}
                <Card 
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
                  onClick={() => setStep('form')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Gift className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Donate a Device</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 text-left">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        Give a laptop, phone, or tablet
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        Direct impact on recipient
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        Earn an Impact SBT badge
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Cash Donation Card */}
                <Card 
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
                  onClick={() => setStep('cash')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                      <DollarSign className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Donate Cash</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 text-left">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Flexible amounts from $5
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Fund repairs or shipping
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Quick and easy process
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setStep('overview')}>
                Back to overview
              </Button>
            </div>
          </>
        );

      case 'cash':
        return (
          <CashDonationFlow 
            preSelectedRecipient={{
              id: request.recipient_id,
              name: recipientName,
              avatar_url: recipientAvatar
            }}
            preSelectedDream={{
              id: request.id,
              device_needed: request.device_needed,
              purpose: request.purpose,
              recipient_id: request.recipient_id,
              recipient_name: recipientName
            }}
            onClose={handleClose}
          />
        );

      case 'form':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Device & Contribution Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Device Type *</Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger><SelectValue placeholder="Select device type" /></SelectTrigger>
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

              {deviceType === 'other' && (
                <div className="space-y-2">
                  <Label>Please specify device type *</Label>
                  <Input 
                    placeholder="e.g., Drawing Tablet, VR Headset" 
                    value={otherDeviceType}
                    onChange={(e) => setOtherDeviceType(e.target.value)}
                  />
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

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as 'new' | 'used' | 'refurbished')}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used - Good Condition</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {request.needs_refurbishing && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                  <p className="text-sm font-medium">Optional: Contribute to Repair Costs</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {getCurrencySymbol(currency)}
                      </span>
                      <Input 
                        type="number" 
                        placeholder="50" 
                        className="pl-7"
                        value={repairContribution}
                        onChange={(e) => setRepairContribution(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getCurrencyLabel(currency)} • Helps cover refurbishing costs
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('overview')}>Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={handleProceedToMedia}
                  disabled={!isDeviceTypeValid || isCreatingDraft}
                >
                  {isCreatingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Upload Photos
                      <Camera className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        );

      case 'media':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Device Photos
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <p className="text-sm text-muted-foreground">
                Please upload clear photos of your device (front and back). These are required for verification.
              </p>

              {draftDonationId && (
                <DeviceMediaUpload
                  donationId={draftDonationId}
                  mediaUrls={mediaUrls}
                  onMediaChange={handleMediaChange}
                />
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('form')}>Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep('confirm')}
                  disabled={!isMediaComplete}
                >
                  Review Donation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'confirm':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Your Donation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              <div className="glass-card rounded-xl p-4">
                <h4 className="font-semibold mb-3">Donation Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Device</dt>
                    <dd className="font-medium capitalize">{deviceType === 'other' ? otherDeviceType : deviceType}</dd>
                  </div>
                  {deviceSpecs && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Specs</dt>
                      <dd className="font-medium">{deviceSpecs}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Condition</dt>
                    <dd className="font-medium capitalize">{condition}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Recipient</dt>
                    <dd className="font-medium">{recipientName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Photos</dt>
                    <dd className="font-medium text-green-600">✓ 4 photos uploaded</dd>
                  </div>
                  {repairContribution && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Repair Contribution</dt>
                      <dd className="font-medium">{getCurrencySymbol(currency)}{repairContribution} {currency}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm flex items-start gap-2">
                  <span className="text-blue-500">📋</span>
                  <span>
                    <strong>Next Steps:</strong> Your device photos will be reviewed by our team. Once verified, you'll be matched with {recipientName}.
                  </span>
                </p>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">🔗</span>
                  <span>
                    <strong>Blockchain Attestation:</strong> After delivery, your impact will be recorded on the Base blockchain as a Soulbound Token (SBT).
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('media')}>Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmitForVerification} 
                  disabled={submitForVerification.isPending}
                >
                  {submitForVerification.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <div className="text-center py-6 space-y-6">
              <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-accent" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Thank You! 🎉</h2>
                <p className="text-muted-foreground">
                  Your donation has been submitted for verification. We'll review your device photos shortly.
                </p>
              </div>

              {/* Status info */}
              <div className="p-4 bg-muted/50 rounded-xl text-left">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    Our team reviews your device photos (usually within 24 hours)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    Once verified, your device is matched to {recipientName}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    You'll receive instructions for shipping or drop-off
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    After delivery, your Impact SBT badge will be minted!
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/donor/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Donate to Another Dreamer
                </Button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
