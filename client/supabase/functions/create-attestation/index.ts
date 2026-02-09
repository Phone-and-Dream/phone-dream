import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Avalanche C-Chain Configuration
const AVALANCHE_RPC_URL = "https://api.avax.network/ext/bc/C/rpc";
const AVALANCHE_TESTNET_RPC_URL = "https://api.avax-test.network/ext/bc/C/rpc";

// ImpactSBT Contract ABI (minimal for minting)
const IMPACT_SBT_ABI = [
  "function mintImpactBadge(address donor, address recipient, string donorId, string recipientId, string deviceType, string condition, string donationId, string region) external returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

interface AttestationRequest {
  donation_id: string;
  donor_id: string;
  recipient_id: string;
  device_type: string;
  condition: string;
  region?: string;
  donor_address?: string;
  recipient_address?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const privateKey = Deno.env.get('AVALANCHE_PRIVATE_KEY');
    const contractAddress = Deno.env.get('AVALANCHE_CONTRACT_ADDRESS');
    const useTestnet = Deno.env.get('AVALANCHE_USE_TESTNET') === 'true';

    const body: AttestationRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Demo mode if no private key or contract configured
    if (!privateKey || !contractAddress) {
      // Generate a mock transaction hash for demo purposes
      const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      const mockTokenId = Math.floor(Math.random() * 1000000);
      const mockAttestationId = `demo_avax_${mockTokenId}`;

      // Store the mock attestation
      const { data, error } = await supabase
        .from('attestations')
        .insert({
          donation_id: body.donation_id,
          donor_id: body.donor_id,
          recipient_id: body.recipient_id,
          tx_hash: mockTxHash,
          network: 'avalanche',
          schema_id: 'impact_sbt_v1',
          attestation_id: mockAttestationId,
          metadata: {
            device_type: body.device_type,
            condition: body.condition,
            region: body.region || 'Unknown',
            timestamp: Date.now(),
            token_id: mockTokenId,
            demo_mode: true,
            contract_address: 'demo_contract'
          }
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          attestation: data,
          demo_mode: true,
          network: 'avalanche',
          message: "Demo attestation created. Configure AVALANCHE_PRIVATE_KEY and AVALANCHE_CONTRACT_ADDRESS for real SBT minting."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real Avalanche SBT Minting
    const rpcUrl = useTestnet ? AVALANCHE_TESTNET_RPC_URL : AVALANCHE_RPC_URL;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Connect to the ImpactSBT contract
    const contract = new ethers.Contract(contractAddress, IMPACT_SBT_ABI, wallet);

    // Use provided addresses or generate placeholder addresses
    // In production, donors/recipients would have wallet addresses linked to their profiles
    const donorAddress = body.donor_address || ethers.ZeroAddress;
    const recipientAddress = body.recipient_address || ethers.ZeroAddress;

    console.log('Minting Impact SBT on Avalanche C-Chain...');
    console.log('Contract:', contractAddress);
    console.log('Donor:', donorAddress);
    console.log('Recipient:', recipientAddress);

    // Call the mintImpactBadge function
    const tx = await contract.mintImpactBadge(
      donorAddress,
      recipientAddress,
      body.donor_id,
      body.recipient_id,
      body.device_type,
      body.condition,
      body.donation_id,
      body.region || 'Unknown'
    );

    console.log('Transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Parse the ImpactBadgeMinted event to get tokenId
    let tokenId = 'unknown';
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === 'ImpactBadgeMinted') {
          tokenId = parsed.args.tokenId.toString();
          break;
        }
      } catch {
        // Not our event, continue
      }
    }

    const attestationId = `sbt_${tokenId}`;

    // Store the attestation
    const { data, error } = await supabase
      .from('attestations')
      .insert({
        donation_id: body.donation_id,
        donor_id: body.donor_id,
        recipient_id: body.recipient_id,
        tx_hash: tx.hash,
        network: 'avalanche',
        schema_id: 'impact_sbt_v1',
        attestation_id: attestationId,
        metadata: {
          device_type: body.device_type,
          condition: body.condition,
          region: body.region || 'Unknown',
          timestamp: Date.now(),
          token_id: tokenId,
          contract_address: contractAddress,
          block_number: receipt.blockNumber,
          minter: wallet.address,
          testnet: useTestnet
        }
      })
      .select()
      .single();

    if (error) throw error;

    const explorerUrl = useTestnet 
      ? `https://testnet.snowtrace.io/tx/${tx.hash}`
      : `https://snowtrace.io/tx/${tx.hash}`;

    return new Response(
      JSON.stringify({
        success: true,
        attestation: data,
        network: 'avalanche',
        testnet: useTestnet,
        token_id: tokenId,
        explorer_url: explorerUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Avalanche SBT minting error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        network: 'avalanche'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
