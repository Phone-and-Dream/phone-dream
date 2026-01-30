import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { useMintBadge, type Device } from '@/hooks/useImpactBadges';
import { WalletModal } from './WalletModal';
import { 
  Award, 
  Wallet, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  ExternalLink,
  Fuel,
} from 'lucide-react';
import { MINT_FEE_AVAX, ACTIVE_NETWORK, USE_TESTNET, getExplorerTxUrl } from '@/lib/blockchain';

interface MintBadgeFlowProps {
  device: Device;
  minterType: 'donor' | 'recipient';
  recipientProfile: { id: string; career?: string };
  donorProfile: { id: string };
  region: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 'check-wallet' | 'check-balance' | 'confirm' | 'minting' | 'success';

export function MintBadgeFlow({
  device,
  minterType,
  recipientProfile,
  donorProfile,
  region,
  open,
  onOpenChange,
  onSuccess,
}: MintBadgeFlowProps) {
  const { activeWallet, hasWallet, balance, isTestnet, network, refreshBalance } = useWallet();
  const mintBadge = useMintBadge();

  const [step, setStep] = useState<Step>('check-wallet');
  const [password, setPassword] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check balance requirements
  const balanceNum = parseFloat(balance);
  const mintFeeNum = parseFloat(MINT_FEE_AVAX);
  const estimatedGas = 0.005; // Conservative gas estimate
  const totalRequired = mintFeeNum + estimatedGas;
  const hasEnoughBalance = balanceNum >= totalRequired;

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setStep(hasWallet ? (hasEnoughBalance ? 'confirm' : 'check-balance') : 'check-wallet');
      setPassword('');
      setTxHash(null);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleMint = async () => {
    setError(null);
    setStep('minting');

    try {
      const result = await mintBadge.mutateAsync({
        device,
        minterType,
        password: activeWallet?.wallet_type === 'created' ? password : undefined,
        recipientProfile,
        donorProfile,
        region,
      });

      setTxHash(result.txHash);
      setStep('success');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
      setStep('confirm');
    }
  };

  const handleWalletSetup = () => {
    setShowWalletModal(true);
  };

  const handleWalletModalClose = (newOpen: boolean) => {
    setShowWalletModal(newOpen);
    if (!newOpen && hasWallet) {
      refreshBalance();
      setStep(hasEnoughBalance ? 'confirm' : 'check-balance');
    }
  };

  const deviceEmoji = device.device_type === 'Phone' || device.device_type === 'Smartphone' 
    ? '📱' 
    : device.device_type === 'Tablet' 
      ? '📱' 
      : device.device_type === 'Desktop' || device.device_type === 'PC'
        ? '🖥️'
        : '💻';

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mint Impact Badge
              {isTestnet && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  Testnet
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Mint a soulbound token as proof of your impact
            </DialogDescription>
          </DialogHeader>

          {/* Step: Check Wallet */}
          {step === 'check-wallet' && (
            <div className="space-y-4">
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  You need a wallet to mint badges on the blockchain.
                </AlertDescription>
              </Alert>

              <div className="text-center py-4">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new wallet or connect an existing one
                </p>
                <Button onClick={handleWalletSetup}>
                  Set Up Wallet
                </Button>
              </div>
            </div>
          )}

          {/* Step: Check Balance */}
          {step === 'check-balance' && (
            <div className="space-y-4">
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm">
                  <p className="font-medium text-yellow-600">Insufficient Balance</p>
                  <p className="mt-1">
                    You need at least {totalRequired.toFixed(4)} AVAX to mint.
                    Current balance: {balanceNum.toFixed(4)} AVAX
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center py-4">
                <Fuel className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                {isTestnet ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Get free test AVAX from the faucet
                    </p>
                    <a
                      href={network.faucetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open Faucet <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">
                      After receiving AVAX, click refresh below
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Send AVAX to your wallet address to continue
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    refreshBalance();
                    if (hasEnoughBalance) setStep('confirm');
                  }}
                >
                  Refresh Balance
                </Button>
                <Button
                  className="flex-1"
                  disabled={!hasEnoughBalance}
                  onClick={() => setStep('confirm')}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {error && (
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-sm text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Badge Preview */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-700/10 border border-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{deviceEmoji}</span>
                  <div>
                    <p className="font-medium">{device.device_type} Impact Badge</p>
                    <p className="text-xs text-muted-foreground">
                      {minterType === 'donor' ? 'Donor Badge' : 'Recipient Badge'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Funding:</span>{' '}
                    {device.funding_type === 'impact_pool' ? 'Impact Pool' : 'Direct Donation'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network:</span>{' '}
                    {ACTIVE_NETWORK.name}
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-3 rounded bg-muted/50 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint Fee</span>
                  <span>{MINT_FEE_AVAX} AVAX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Gas</span>
                  <span>~{estimatedGas} AVAX</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Total</span>
                  <span>~{totalRequired.toFixed(4)} AVAX</span>
                </div>
              </div>

              {/* Password for created wallets */}
              {activeWallet?.wallet_type === 'created' && (
                <div>
                  <Label htmlFor="mint-password">Wallet Password</Label>
                  <Input
                    id="mint-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your wallet password"
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleMint}
                  disabled={activeWallet?.wallet_type === 'created' && !password}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Mint Badge
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step: Minting */}
          {step === 'minting' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="font-medium">Minting your badge...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <p className="font-medium text-lg">Badge Minted!</p>
                <p className="text-sm text-muted-foreground">
                  Your Impact Badge is now on the blockchain
                </p>
              </div>

              {txHash && (
                <a
                  href={getExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View Transaction <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <Button onClick={() => handleOpenChange(false)} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <WalletModal open={showWalletModal} onOpenChange={handleWalletModalClose} />
    </>
  );
}
