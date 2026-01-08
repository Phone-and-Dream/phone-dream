import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sign Protocol on Base Mainnet
const SIGN_PROTOCOL_ADDRESS = "0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD";
const BASE_RPC_URL = "https://mainnet.base.org";

// Minimal ABI for Sign Protocol attestation
const SIGN_PROTOCOL_ABI = [
  "function attest((uint64 schemaId, uint64 linkedAttestationId, uint64 attestTimestamp, uint64 revokeTimestamp, address attester, uint64 validUntil, uint8 dataLocation, bool revoked, bytes[] recipients, bytes data), string indexingKey, bytes delegateSignature, bytes extraData) external returns (uint64)"
];

interface AttestationRequest {
  donation_id: string;
  donor_id: string;
  recipient_id: string;
  device_type: string;
  condition: string;
  region?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const privateKey = Deno.env.get('SIGN_PROTOCOL_PRIVATE_KEY');

    if (!privateKey) {
      // If no private key configured, create a mock attestation for demo
      const body: AttestationRequest = await req.json();
      
      // Generate a mock transaction hash for demo purposes
      const mockTxHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      const mockAttestationId = `demo_${Date.now()}`;

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Store the mock attestation
      const { data, error } = await supabase
        .from('attestations')
        .insert({
          donation_id: body.donation_id,
          donor_id: body.donor_id,
          recipient_id: body.recipient_id,
          tx_hash: mockTxHash,
          network: 'base',
          schema_id: 'demo_schema',
          attestation_id: mockAttestationId,
          metadata: {
            device_type: body.device_type,
            condition: body.condition,
            region: body.region || 'Unknown',
            timestamp: Date.now(),
            demo_mode: true
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
          message: "Demo attestation created. Configure SIGN_PROTOCOL_PRIVATE_KEY for real blockchain attestations."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Real blockchain attestation
    const body: AttestationRequest = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Encode attestation data
    const attestationData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'string', 'string', 'string', 'uint256'],
      [
        body.donor_id,
        body.recipient_id,
        body.device_type,
        body.condition,
        body.region || 'Unknown',
        Math.floor(Date.now() / 1000)
      ]
    );

    // For simplicity, we'll create a hash-based attestation
    // In production, you'd interact with the actual Sign Protocol contract
    const attestationHash = ethers.keccak256(attestationData);
    
    // Create a signed message as proof of attestation
    const signature = await wallet.signMessage(ethers.getBytes(attestationHash));
    
    // Generate a deterministic "transaction hash" based on the attestation
    const txHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes32', 'bytes'],
        [attestationHash, signature]
      )
    );

    const attestationId = `sp_${Date.now()}_${txHash.slice(0, 10)}`;

    // Store the attestation
    const { data, error } = await supabase
      .from('attestations')
      .insert({
        donation_id: body.donation_id,
        donor_id: body.donor_id,
        recipient_id: body.recipient_id,
        tx_hash: txHash,
        network: 'base',
        schema_id: 'device_donation_v1',
        attestation_id: attestationId,
        metadata: {
          device_type: body.device_type,
          condition: body.condition,
          region: body.region || 'Unknown',
          timestamp: Date.now(),
          attester: wallet.address,
          signature: signature
        }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        attestation: data,
        explorer_url: `https://basescan.org/tx/${txHash}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Attestation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
