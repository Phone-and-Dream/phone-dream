// Wallet utilities for creating, encrypting, and managing wallets
import { ethers } from 'ethers';
import { ACTIVE_NETWORK } from './blockchain';

// Encryption key derivation using Web Crypto API
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt seed phrase with password
export async function encryptSeedPhrase(seedPhrase: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seedPhrase);
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key from password
  const key = await deriveKey(password, salt.buffer as ArrayBuffer);
  
  // Encrypt the seed phrase
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine salt + iv + encrypted data and encode as base64
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// Decrypt seed phrase with password
export async function decryptSeedPhrase(encryptedData: string, password: string): Promise<string> {
  try {
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Derive encryption key from password
    const key = await deriveKey(password, salt.buffer as ArrayBuffer);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt seed phrase. Invalid password.');
  }
}

// Generate a new wallet
export function generateWallet(): { address: string; seedPhrase: string; privateKey: string } {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    seedPhrase: wallet.mnemonic?.phrase || '',
    privateKey: wallet.privateKey,
  };
}

// Restore wallet from seed phrase
export function restoreWalletFromSeed(seedPhrase: string): { address: string; privateKey: string } | null {
  try {
    const wallet = ethers.Wallet.fromPhrase(seedPhrase);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch {
    return null;
  }
}

// Validate seed phrase
export function isValidSeedPhrase(seedPhrase: string): boolean {
  try {
    ethers.Wallet.fromPhrase(seedPhrase);
    return true;
  } catch {
    return false;
  }
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

// Get AVAX balance for an address
export async function getAvaxBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return '0';
  }
}

// Create a signer from private key for transactions
export function createSigner(privateKey: string): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(ACTIVE_NETWORK.rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Check if MetaMask is available
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

// Request MetaMask connection and get address
export async function connectMetaMask(): Promise<string | null> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts && accounts.length > 0) {
      return accounts[0];
    }
    return null;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw error;
  }
}

// Switch MetaMask to Avalanche network
export async function switchToAvalancheNetwork(): Promise<boolean> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ACTIVE_NETWORK.chainIdHex }],
    });
    return true;
  } catch (error: any) {
    // Chain not added to MetaMask, try to add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ACTIVE_NETWORK.chainIdHex,
              chainName: ACTIVE_NETWORK.name,
              nativeCurrency: ACTIVE_NETWORK.nativeCurrency,
              rpcUrls: [ACTIVE_NETWORK.rpcUrl],
              blockExplorerUrls: [ACTIVE_NETWORK.explorerUrl],
            },
          ],
        });
        return true;
      } catch (addError) {
        throw new Error('Failed to add Avalanche network to MetaMask');
      }
    }
    throw error;
  }
}

// Get current MetaMask chain ID
export async function getMetaMaskChainId(): Promise<number | null> {
  if (!isMetaMaskAvailable()) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch {
    return null;
  }
}

// Sign a message with MetaMask (for wallet verification)
export async function signMessageWithMetaMask(message: string, address: string): Promise<string> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
    return signature;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the signature request');
    }
    throw error;
  }
}

// Create a Web3Provider from MetaMask for transactions
export function getMetaMaskProvider(): ethers.BrowserProvider | null {
  if (!isMetaMaskAvailable()) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
