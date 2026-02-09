// Hook for managing Impact Badges
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import {
  ACTIVE_CONTRACT_ADDRESS,
  IMPACT_SBT_ABI,
  MINT_FEE_AVAX,
  FundingType,
  MinterType,
  getExplorerTxUrl,
  parseAvax,
} from '@/lib/blockchain';
import {
  createSigner,
  decryptSeedPhrase,
  getMetaMaskProvider,
} from '@/lib/wallet';

export interface Device {
  id: string;
  device_type: string;
  condition: string;
  funding_type: 'physical_device' | 'impact_pool';
  donation_id: string | null;
  assigned_recipient_id: string | null;
  recipient_career_at_assignment: string | null;
  handover_date: string | null;
  admin_confirmed: boolean;
  minting_enabled: boolean;
  created_at: string;
}

export interface ImpactBadge {
  id: string;
  device_id: string;
  minter_user_id: string;
  minter_type: 'donor' | 'recipient';
  wallet_address: string;
  token_id: string | null;
  tx_hash: string | null;
  network: string;
  minted_at: string;
  metadata: Record<string, any> | null;
  device?: Device;
}

export interface ImpactPoolContributor {
  id: string;
  device_id: string;
  donor_id: string;
  contribution_amount: number | null;
  created_at: string;
  donor_profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Get badges grouped by device type
export function useImpactBadges(userId: string) {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['impact-badges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_badges')
        .select(`
          *,
          device:devices(*)
        `)
        .eq('minter_user_id', userId)
        .order('minted_at', { ascending: false });

      if (error) throw error;
      return data as ImpactBadge[];
    },
    enabled: !!userId,
  });

  // Group badges by device type
  const groupedBadges = badges.reduce((acc, badge) => {
    const deviceType = badge.device?.device_type || 'Unknown';
    if (!acc[deviceType]) {
      acc[deviceType] = [];
    }
    acc[deviceType].push(badge);
    return acc;
  }, {} as Record<string, ImpactBadge[]>);

  return {
    badges,
    groupedBadges,
    isLoading,
    totalBadges: badges.length,
  };
}

// Get mintable devices for a user
export function useMintableDevices(userId: string, userRole: 'donor' | 'recipient') {
  return useQuery({
    queryKey: ['mintable-devices', userId, userRole],
    queryFn: async () => {
      // Get devices where minting is enabled
      let query = supabase
        .from('devices')
        .select('*')
        .eq('minting_enabled', true);

      if (userRole === 'recipient') {
        // Recipients can only mint for devices assigned to them
        query = query.eq('assigned_recipient_id', userId);
      }

      const { data: devices, error } = await query;
      if (error) throw error;

      // Get already minted badges for this user
      const { data: mintedBadges } = await supabase
        .from('impact_badges')
        .select('device_id')
        .eq('minter_user_id', userId);

      const mintedDeviceIds = new Set(mintedBadges?.map(b => b.device_id) || []);

      // Filter out already minted devices
      return (devices || []).filter(d => !mintedDeviceIds.has(d.id)) as Device[];
    },
    enabled: !!userId,
  });
}

// Get contributors for an impact pool device
export function useImpactPoolContributors(deviceId: string) {
  return useQuery({
    queryKey: ['impact-pool-contributors', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_pool_contributors')
        .select(`
          *,
          donor_profile:profiles!donor_id(id, full_name, avatar_url)
        `)
        .eq('device_id', deviceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ImpactPoolContributor[];
    },
    enabled: !!deviceId,
  });
}

// Mint badge mutation
export function useMintBadge() {
  const { user } = useAuth();
  const { activeWallet } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      device,
      minterType,
      password,
      recipientProfile,
      donorProfile,
      region,
    }: {
      device: Device;
      minterType: 'donor' | 'recipient';
      password?: string; // Required for created wallets
      recipientProfile: { id: string; career?: string };
      donorProfile: { id: string };
      region: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!activeWallet) throw new Error('No wallet connected');
      if (!ACTIVE_CONTRACT_ADDRESS) throw new Error('Contract not deployed');

      let signer: ethers.Signer;

      // Get signer based on wallet type
      if (activeWallet.wallet_type === 'created') {
        if (!password) throw new Error('Password required for created wallet');
        if (!activeWallet.encrypted_seed) throw new Error('Wallet seed not found');

        const seedPhrase = await decryptSeedPhrase(activeWallet.encrypted_seed, password);
        const wallet = ethers.Wallet.fromPhrase(seedPhrase);
        signer = createSigner(wallet.privateKey);
      } else {
        // MetaMask or external wallet
        const provider = getMetaMaskProvider();
        if (!provider) throw new Error('MetaMask not available');
        signer = await provider.getSigner();
      }

      // Create contract instance
      const contract = new ethers.Contract(
        ACTIVE_CONTRACT_ADDRESS,
        IMPACT_SBT_ABI,
        signer
      );

      // Prepare mint parameters
      const fundingType = device.funding_type === 'impact_pool' 
        ? FundingType.ImpactPool 
        : FundingType.PhysicalDevice;

      const handoverTimestamp = device.handover_date 
        ? Math.floor(new Date(device.handover_date).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

      const mintFee = parseAvax(MINT_FEE_AVAX);

      // Call appropriate mint function
      const mintFunction = minterType === 'donor' 
        ? contract.mintDonorBadge 
        : contract.mintRecipientBadge;

      const tx = await mintFunction(
        device.id,
        device.device_type,
        fundingType,
        donorProfile.id,
        recipientProfile.id,
        recipientProfile.career || 'Unknown',
        region,
        handoverTimestamp,
        { value: mintFee }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Extract token ID from event logs
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'ImpactBadgeMinted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent);
        tokenId = parsed?.args?.tokenId?.toString();
      }

      // Validate and store badge via edge function
      const { data: validateResponse, error: validateError } = await supabase
        .functions.invoke('validate-mint', {
          body: {
            tx_hash: receipt.hash,
            device_id: device.id,
            minter_type: minterType,
            expected_token_id: tokenId,
          },
        });

      if (validateError) {
        console.error('Validate mint error:', validateError);
        throw new Error('Failed to validate mint on server');
      }

      if (!validateResponse?.success) {
        const errorMessage = validateResponse?.error || 'Unknown validation error';
        throw new Error(`Mint validation failed: ${errorMessage}`);
      }

      return { badge: validateResponse.badge, txHash: receipt.hash, tokenId };
    },
    onSuccess: ({ txHash }) => {
      queryClient.invalidateQueries({ queryKey: ['impact-badges'] });
      queryClient.invalidateQueries({ queryKey: ['mintable-devices'] });
      
      toast.success('Impact Badge minted successfully!', {
        description: 'View transaction on explorer',
        action: {
          label: 'View',
          onClick: () => window.open(getExplorerTxUrl(txHash), '_blank'),
        },
      });
    },
    onError: (error: Error) => {
      console.error('Mint error:', error);
      toast.error('Failed to mint badge: ' + error.message);
    },
  });
}

// Get device details with all related data
export function useDeviceImpact(deviceId: string) {
  return useQuery({
    queryKey: ['device-impact', deviceId],
    queryFn: async () => {
      // Get device
      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .single();

      if (deviceError) throw deviceError;

      // Get badges for this device
      const { data: badges } = await supabase
        .from('impact_badges')
        .select('*')
        .eq('device_id', deviceId);

      // Get contributors if impact pool
      let contributors: ImpactPoolContributor[] = [];
      if (device.funding_type === 'impact_pool') {
        const { data: contribData } = await supabase
          .from('impact_pool_contributors')
          .select(`
            *,
            donor_profile:profiles!donor_id(id, full_name, avatar_url)
          `)
          .eq('device_id', deviceId);
        contributors = contribData || [];
      }

      // Get recipient profile
      let recipientProfile = null;
      if (device.assigned_recipient_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', device.assigned_recipient_id)
          .single();
        recipientProfile = data;
      }

      return {
        device: device as Device,
        badges: badges as ImpactBadge[] || [],
        contributors,
        recipientProfile,
      };
    },
    enabled: !!deviceId,
  });
}
