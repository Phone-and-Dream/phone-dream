import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { isMetaMaskAvailable } from '@/lib/wallet';
import { 
  Wallet, 
  Plus, 
  Link, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'create' | 'connect' | 'export';
}

export function WalletModal({ open, onOpenChange, defaultTab = 'create' }: WalletModalProps) {
  const { 
    activeWallet, 
    createWallet, 
    isCreatingWallet, 
    connectExternalWallet, 
    isConnectingWallet,
    exportWallet,
    isTestnet,
    network,
  } = useWallet();

  const [tab, setTab] = useState(defaultTab);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newWalletData, setNewWalletData] = useState<{ address: string; seedPhrase: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportedSeed, setExportedSeed] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleCreateWallet = async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const result = await createWallet(password);
      setNewWalletData({ address: result.address, seedPhrase: result.seedPhrase });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectExternalWallet();
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExportWallet = async () => {
    if (!exportPassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsExporting(true);
    try {
      const seed = await exportWallet(exportPassword);
      setExportedSeed(seed);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setNewWalletData(null);
    setExportPassword('');
    setExportedSeed('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Setup
          </DialogTitle>
          <DialogDescription>
            Set up a wallet to mint Impact Badges on the blockchain
            {isTestnet && (
              <Badge variant="outline" className="ml-2 text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                Testnet
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Create
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              Connect
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              disabled={!activeWallet || activeWallet.wallet_type !== 'created'}
              className="flex items-center gap-1"
            >
              <Key className="h-3 w-3" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Create New Wallet */}
          <TabsContent value="create" className="space-y-4">
            {!newWalletData ? (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This will create a new wallet. You'll receive a seed phrase - 
                    <strong> write it down and keep it safe</strong>. Lost seed phrases cannot be recovered.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used to encrypt your seed phrase
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateWallet} 
                  disabled={isCreatingWallet}
                  className="w-full"
                >
                  {isCreatingWallet ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Wallet
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Alert className="border-green-500/30 bg-green-500/10">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs">
                    Wallet created successfully! Save your seed phrase now.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                        {newWalletData.address}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(newWalletData.address)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-destructive">Seed Phrase (SAVE THIS!)</Label>
                    <div className="relative">
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm font-mono break-words">
                        {newWalletData.seedPhrase}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(newWalletData.seedPhrase)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ Never share your seed phrase. Anyone with it has full access to your wallet.
                    </p>
                  </div>
                </div>

                <Button onClick={handleClose} className="w-full">
                  I've Saved My Seed Phrase
                </Button>
              </>
            )}
          </TabsContent>

          {/* Connect Existing Wallet */}
          <TabsContent value="connect" className="space-y-4">
            <Alert>
              <AlertDescription className="text-xs">
                Connect an existing wallet like MetaMask or Core Wallet. 
                Your private keys stay in your wallet - we only store your address.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button 
                onClick={handleConnectWallet}
                disabled={isConnectingWallet || !isMetaMaskAvailable()}
                className="w-full"
                variant="outline"
              >
                {isConnectingWallet ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                      alt="MetaMask" 
                      className="h-5 w-5 mr-2"
                    />
                    Connect MetaMask
                  </>
                )}
              </Button>

              {!isMetaMaskAvailable() && (
                <p className="text-xs text-muted-foreground text-center">
                  MetaMask not detected.{' '}
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Install MetaMask <ExternalLink className="inline h-3 w-3" />
                  </a>
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Network: <span className="font-medium">{network.name}</span>
            </div>
          </TabsContent>

          {/* Export Wallet */}
          <TabsContent value="export" className="space-y-4">
            {activeWallet?.wallet_type !== 'created' ? (
              <Alert>
                <AlertDescription className="text-xs">
                  Export is only available for wallets created in this app.
                  Connected wallets are managed by their original provider.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-xs">
                    <strong>Security Warning:</strong> Your seed phrase gives full access to your wallet.
                    Only export if you need to import into another wallet app.
                  </AlertDescription>
                </Alert>

                {!exportedSeed ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="export-password">Enter Password</Label>
                      <Input
                        id="export-password"
                        type="password"
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        placeholder="Your wallet password"
                      />
                    </div>

                    <Button 
                      onClick={handleExportWallet}
                      disabled={isExporting}
                      variant="destructive"
                      className="w-full"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Reveal Seed Phrase
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-destructive">Your Seed Phrase</Label>
                      <div className="relative">
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm font-mono break-words">
                          {exportedSeed}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(exportedSeed)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        setExportedSeed('');
                        setExportPassword('');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Hide Seed Phrase
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
