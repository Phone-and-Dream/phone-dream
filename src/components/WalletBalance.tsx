import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { WalletModal } from './WalletModal';
import { 
  Wallet, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getExplorerAddressUrl } from '@/lib/blockchain';

interface WalletBalanceProps {
  compact?: boolean;
}

export function WalletBalance({ compact = false }: WalletBalanceProps) {
  const {
    activeWallet,
    balance,
    isLoading,
    isLoadingBalance,
    hasWallet,
    isTestnet,
    network,
    refreshBalance,
    truncatedAddress,
  } = useWallet();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (activeWallet?.wallet_address) {
      navigator.clipboard.writeText(activeWallet.wallet_address);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (activeWallet?.wallet_address) {
      window.open(getExplorerAddressUrl(activeWallet.wallet_address), '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className={compact ? 'p-0' : 'pt-6'}>
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasWallet) {
    return (
      <>
        <Card className={`${compact ? 'p-3' : ''} border-dashed`}>
          <CardContent className={compact ? 'p-0' : 'pt-6'}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No Wallet Connected</p>
                  <p className="text-xs text-muted-foreground">
                    Required for minting badges
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowWalletModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Setup
              </Button>
            </div>
          </CardContent>
        </Card>
        <WalletModal open={showWalletModal} onOpenChange={setShowWalletModal} />
      </>
    );
  }

  const balanceNum = parseFloat(balance);
  const lowBalance = balanceNum < 0.02;

  return (
    <>
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className={compact ? 'p-0' : 'pt-6'}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyAddress}
                    className="text-sm font-mono hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {truncatedAddress}
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <button onClick={openExplorer} className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isLoadingBalance ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <>{parseFloat(balance).toFixed(4)} AVAX</>
                    )}
                  </span>
                  <button
                    onClick={refreshBalance}
                    disabled={isLoadingBalance}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {isTestnet && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  Testnet
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowWalletModal(true)}
                className="text-xs"
              >
                Manage
              </Button>
            </div>
          </div>

          {lowBalance && (
            <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-yellow-600">Low Balance</p>
                <p className="text-muted-foreground">
                  {isTestnet ? (
                    <>
                      Get test AVAX from the{' '}
                      <a
                        href={network.faucetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        faucet
                      </a>
                    </>
                  ) : (
                    'Add AVAX to mint badges (~0.02 AVAX per mint)'
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <WalletModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  );
}
