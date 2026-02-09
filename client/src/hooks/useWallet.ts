// Hook for managing user wallets
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  generateWallet,
  encryptSeedPhrase,
  decryptSeedPhrase,
  getAvaxBalance,
  connectMetaMask,
  switchToAvalancheNetwork,
  isMetaMaskAvailable,
  truncateAddress,
} from '@/lib/wallet';
import { ACTIVE_NETWORK, USE_TESTNET } from '@/lib/blockchain';

export interface UserWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: 'created' | 'connected';
  encrypted_seed: string | null;
  is_active: boolean;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch user's active wallet
  const { data: activeWallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['user-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as UserWallet | null;
    },
    enabled: !!user?.id,
  });

  // Fetch all user wallets
  const { data: allWallets = [] } = useQuery({
    queryKey: ['user-wallets-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserWallet[];
    },
    enabled: !!user?.id,
  });

  // Fetch balance when wallet changes
  const fetchBalance = useCallback(async () => {
    if (!activeWallet?.wallet_address) {
      setBalance('0');
      return;
    }

    setIsLoadingBalance(true);
    try {
      const bal = await getAvaxBalance(activeWallet.wallet_address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [activeWallet?.wallet_address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Create a new wallet
  const createWalletMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate new wallet
      const { address, seedPhrase } = generateWallet();

      // Encrypt seed phrase
      const encryptedSeed = await encryptSeedPhrase(seedPhrase, password);

      // Deactivate existing wallets
      await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Insert new wallet
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          wallet_address: address,
          wallet_type: 'created',
          encrypted_seed: encryptedSeed,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return { wallet: data, seedPhrase, address };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets-all'] });
      toast.success('Wallet created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create wallet: ' + error.message);
    },
  });

  // Connect external wallet (MetaMask)
  const connectExternalWalletMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      if (!isMetaMaskAvailable()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      }

      // Switch to Avalanche network first
      await switchToAvalancheNetwork();

      // Connect and get address
      const address = await connectMetaMask();
      if (!address) throw new Error('Failed to get wallet address');

      // Check if this wallet is already connected
      const { data: existing } = await supabase
        .from('user_wallets')
        .select('id')
        .eq('user_id', user.id)
        .eq('wallet_address', address)
        .maybeSingle();

      if (existing) {
        // Just activate the existing wallet
        await supabase
          .from('user_wallets')
          .update({ is_active: false })
          .eq('user_id', user.id);

        await supabase
          .from('user_wallets')
          .update({ is_active: true })
          .eq('id', existing.id);

        return { address, isExisting: true };
      }

      // Deactivate existing wallets
      await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Insert new connected wallet
      const { error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: user.id,
          wallet_address: address,
          wallet_type: 'connected',
          encrypted_seed: null,
          is_active: true,
        });

      if (error) throw error;

      return { address, isExisting: false };
    },
    onSuccess: ({ isExisting }) => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets-all'] });
      toast.success(isExisting ? 'Wallet reconnected' : 'Wallet connected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Export wallet (decrypt seed phrase)
  const exportWallet = useCallback(async (password: string): Promise<string> => {
    if (!activeWallet?.encrypted_seed) {
      throw new Error('No seed phrase available for this wallet');
    }

    if (activeWallet.wallet_type !== 'created') {
      throw new Error('Cannot export externally connected wallets');
    }

    const seedPhrase = await decryptSeedPhrase(activeWallet.encrypted_seed, password);
    return seedPhrase;
  }, [activeWallet]);

  // Switch active wallet
  const switchWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Deactivate all wallets
      await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate selected wallet
      const { error } = await supabase
        .from('user_wallets')
        .update({ is_active: true })
        .eq('id', walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets-all'] });
      toast.success('Wallet switched');
    },
    onError: (error: Error) => {
      toast.error('Failed to switch wallet: ' + error.message);
    },
  });

  // Delete wallet
  const deleteWalletMutation = useMutation({
    mutationFn: async (walletId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('id', walletId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['user-wallets-all'] });
      toast.success('Wallet removed');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove wallet: ' + error.message);
    },
  });

  return {
    // State
    activeWallet,
    allWallets,
    balance,
    isLoading: isLoadingWallet,
    isLoadingBalance,
    hasWallet: !!activeWallet,
    isTestnet: USE_TESTNET,
    network: ACTIVE_NETWORK,

    // Actions
    createWallet: createWalletMutation.mutateAsync,
    isCreatingWallet: createWalletMutation.isPending,
    
    connectExternalWallet: connectExternalWalletMutation.mutateAsync,
    isConnectingWallet: connectExternalWalletMutation.isPending,
    
    exportWallet,
    
    switchWallet: switchWalletMutation.mutateAsync,
    isSwitchingWallet: switchWalletMutation.isPending,
    
    deleteWallet: deleteWalletMutation.mutateAsync,
    isDeletingWallet: deleteWalletMutation.isPending,
    
    refreshBalance: fetchBalance,

    // Helpers
    truncatedAddress: activeWallet?.wallet_address 
      ? truncateAddress(activeWallet.wallet_address) 
      : null,
  };
}
