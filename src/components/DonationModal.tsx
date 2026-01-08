import { useState } from 'react';
import { X, Heart, ArrowRight, Check, ExternalLink, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RankBadge } from '@/components/ui/rank-badge';
import { NFTBadge } from '@/components/NFTBadge';
import { DreamRequest } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface DonationModalProps {
  request: DreamRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

type DonationStep = 'overview' | 'form' | 'confirm' | 'success';

export function DonationModal({ request, isOpen, onClose }: DonationModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<DonationStep>('overview');
  const [deviceType, setDeviceType] = useState('');
  const [otherDeviceType, setOtherDeviceType] = useState('');
  const [condition, setCondition] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [repairContribution, setRepairContribution] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const handleClose = () => {
    setStep('overview');
    setDeviceType('');
    setCondition('');
    setCurrency('USD');
    setRepairContribution('');
    onClose();
  };

  const handleSubmit = () => {
    setStep('success');
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

  if (!request) return null;

  const renderStep = () => {
    switch (step) {
      case 'overview':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Support {request.recipientName}'s Dream
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Recipient Summary */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl">
                <img 
                  src={request.recipientAvatar} 
                  alt={request.recipientName} 
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{request.recipientName}</h3>
                    <RankBadge rank={request.xpRank} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{request.creatorType} • {request.region}</p>
                </div>
              </div>

              {/* Device Needed */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Device Needed</p>
                <p className="text-xl font-bold text-primary">{request.deviceNeeded}</p>
                {request.needsRefurbishing && (
                  <p className="text-xs text-amber-600 mt-1">✨ Open to refurbished devices</p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Their Story</p>
                <p className="text-sm">{request.purpose}</p>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">What They'll Achieve</p>
                <ul className="space-y-1">
                  {request.milestones.map((milestone, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/recipient/profile/${request.recipientId}`}>View Full Profile</Link>
                </Button>
                <Button className="flex-1" onClick={() => setStep('form')}>
                  Proceed to Donate
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'form':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Device & Contribution Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Name / Organization *</Label>
                  <Input 
                    placeholder="Name or organization" 
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </div>

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
                <Label>Condition *</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used - Good Condition</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {request.needsRefurbishing && (
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
                  {(currency === 'USDC' || currency === 'USDT') && (
                    <p className="text-xs text-primary">
                      Crypto payments processed via Base network
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('overview')}>Back</Button>
                <Button className="flex-1" onClick={() => setStep('confirm')}>
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
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Condition</dt>
                    <dd className="font-medium capitalize">{condition}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Recipient</dt>
                    <dd className="font-medium">{request.recipientName}</dd>
                  </div>
                  {repairContribution && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Repair Contribution</dt>
                      <dd className="font-medium">{getCurrencySymbol(currency)}{repairContribution} {currency}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">🔗</span>
                  <span>
                    <strong>Blockchain Attestation:</strong> Your donation will be recorded on the Base blockchain as a Soulbound Token (SBT), creating permanent, verifiable proof of your impact.
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('form')}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm & Submit
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
                  Your donation has been submitted. You're helping {request.recipientName} achieve their dreams!
                </p>
              </div>

              {/* NFT Badge Preview */}
              <div className="flex justify-center">
                <NFTBadge
                  donorName={donorName || "Anonymous Donor"}
                  donorId="preview"
                  recipientName={request.recipientName}
                  recipientId={request.recipientId}
                  deviceType={deviceType === 'other' ? otherDeviceType : deviceType}
                  condition={condition === 'new' ? 'New' : 'Refurbished'}
                  txHash="0x7a3b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c"
                  date={new Date().toISOString()}
                  size="md"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Your Impact Link Badge (SBT) will be minted once the donation is verified.</p>
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
