// Blockchain configuration for Avalanche networks and Impact Badge SBT

export const NETWORK_CONFIG = {
  testnet: {
    chainId: 43113,
    chainIdHex: '0xa869',
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    faucetUrl: 'https://faucet.avax.network',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
  },
  mainnet: {
    chainId: 43114,
    chainIdHex: '0xa86a',
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    faucetUrl: undefined,
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
  },
} as const;

// Use testnet by default - will switch to mainnet after validation
export const USE_TESTNET = true;
export const ACTIVE_NETWORK = USE_TESTNET ? NETWORK_CONFIG.testnet : NETWORK_CONFIG.mainnet;

// Contract addresses (to be set after deployment)
export const CONTRACT_ADDRESSES = {
  testnet: import.meta.env.VITE_IMPACT_SBT_TESTNET_ADDRESS || '',
  mainnet: import.meta.env.VITE_IMPACT_SBT_MAINNET_ADDRESS || '',
};

export const ACTIVE_CONTRACT_ADDRESS = USE_TESTNET 
  ? CONTRACT_ADDRESSES.testnet 
  : CONTRACT_ADDRESSES.mainnet;

// Mint fee in AVAX (~$2)
export const MINT_FEE_AVAX = '0.01';

// ImpactSBT Contract ABI (essential functions only)
export const IMPACT_SBT_ABI = [
  // Read functions
  {
    inputs: [],
    name: 'mintFee',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'deviceId', type: 'string' }, { name: 'user', type: 'address' }],
    name: 'hasUserMintedForDevice',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getImpactData',
    outputs: [{
      components: [
        { name: 'deviceId', type: 'string' },
        { name: 'deviceType', type: 'string' },
        { name: 'fundingType', type: 'uint8' },
        { name: 'minterType', type: 'uint8' },
        { name: 'donorId', type: 'string' },
        { name: 'recipientId', type: 'string' },
        { name: 'recipientCareer', type: 'string' },
        { name: 'region', type: 'string' },
        { name: 'handoverTimestamp', type: 'uint256' },
        { name: 'mintTimestamp', type: 'uint256' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [
      { name: 'deviceId', type: 'string' },
      { name: 'deviceType', type: 'string' },
      { name: 'fundingType', type: 'uint8' },
      { name: 'donorId', type: 'string' },
      { name: 'recipientId', type: 'string' },
      { name: 'recipientCareer', type: 'string' },
      { name: 'region', type: 'string' },
      { name: 'handoverTimestamp', type: 'uint256' },
    ],
    name: 'mintDonorBadge',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'deviceId', type: 'string' },
      { name: 'deviceType', type: 'string' },
      { name: 'fundingType', type: 'uint8' },
      { name: 'donorId', type: 'string' },
      { name: 'recipientId', type: 'string' },
      { name: 'recipientCareer', type: 'string' },
      { name: 'region', type: 'string' },
      { name: 'handoverTimestamp', type: 'uint256' },
    ],
    name: 'mintRecipientBadge',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'minter', type: 'address' },
      { indexed: false, name: 'minterType', type: 'uint8' },
      { indexed: false, name: 'deviceId', type: 'string' },
      { indexed: false, name: 'fundingType', type: 'uint8' },
    ],
    name: 'ImpactBadgeMinted',
    type: 'event',
  },
] as const;

// Funding type enum values (must match contract)
export enum FundingType {
  PhysicalDevice = 0,
  ImpactPool = 1,
}

// Minter type enum values (must match contract)
export enum MinterType {
  Donor = 0,
  Recipient = 1,
}

// Helper to get explorer URL for a transaction
export function getExplorerTxUrl(txHash: string): string {
  return `${ACTIVE_NETWORK.explorerUrl}/tx/${txHash}`;
}

// Helper to get explorer URL for an address
export function getExplorerAddressUrl(address: string): string {
  return `${ACTIVE_NETWORK.explorerUrl}/address/${address}`;
}

// Helper to get explorer URL for a token
export function getExplorerTokenUrl(tokenId: string): string {
  return `${ACTIVE_NETWORK.explorerUrl}/token/${ACTIVE_CONTRACT_ADDRESS}?a=${tokenId}`;
}

// Format AVAX amount for display
export function formatAvax(wei: bigint): string {
  const avax = Number(wei) / 1e18;
  return avax.toFixed(4);
}

// Parse AVAX to wei
export function parseAvax(avax: string): bigint {
  const wei = Math.floor(parseFloat(avax) * 1e18);
  return BigInt(wei);
}
