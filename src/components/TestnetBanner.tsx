import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { USE_TESTNET, ACTIVE_NETWORK } from '@/lib/blockchain';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

const SESSION_STORAGE_KEY = 'testnet-banner-minimized';

export function TestnetBanner() {
  const [isMinimized, setIsMinimized] = useState(false);
  const { activeWallet } = useWallet();

  // Load minimized state from sessionStorage
  useEffect(() => {
    const minimized = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (minimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  // Don't render if not on testnet
  if (!USE_TESTNET) {
    return null;
  }

  const handleMinimize = () => {
    setIsMinimized(true);
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  };

  const handleExpand = () => {
    setIsMinimized(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Build faucet URL with wallet address if available
  const faucetUrl = activeWallet?.wallet_address
    ? `${ACTIVE_NETWORK.faucetUrl}?address=${activeWallet.wallet_address}`
    : ACTIVE_NETWORK.faucetUrl;

  if (isMinimized) {
    return (
      <button
        onClick={handleExpand}
        className={cn(
          "fixed top-2 right-2 z-[60] flex items-center gap-1.5 px-2 py-1 rounded-md",
          "bg-amber-500 text-amber-950 text-xs font-medium",
          "hover:bg-amber-400 transition-colors shadow-md"
        )}
      >
        <AlertTriangle className="h-3 w-3" />
        TESTNET
        <ChevronUp className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="bg-amber-500 text-amber-950 py-2 px-4 relative z-[60]">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">TESTNET MODE</span>
          <span className="sm:hidden">TESTNET</span>
          <span className="hidden md:inline">— {ACTIVE_NETWORK.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {faucetUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 bg-amber-100 border-amber-600 text-amber-900 hover:bg-amber-200 hover:text-amber-950"
              onClick={() => window.open(faucetUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Get Test AVAX</span>
              <span className="sm:hidden">Faucet</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-amber-900 hover:bg-amber-400 hover:text-amber-950"
            onClick={handleMinimize}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Minimize banner</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
