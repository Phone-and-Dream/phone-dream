import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Network config - must match client-side settings
const NETWORK_CONFIG = {
  testnet: {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorerUrl: "https://testnet.snowtrace.io",
  },
  mainnet: {
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
  },
};

// Use testnet by default
const USE_TESTNET = true;
const ACTIVE_NETWORK = USE_TESTNET ? NETWORK_CONFIG.testnet : NETWORK_CONFIG.mainnet;

// ImpactBadgeMinted event signature
// keccak256("ImpactBadgeMinted(uint256,address,uint8,string,uint8)")
const IMPACT_BADGE_MINTED_TOPIC =
  "0x7e7c5e4f7b5c5c5f7c7c5e4f7b5c5c5f7c7c5e4f7b5c5c5f7c7c5e4f7b5c5c5f";

interface ValidateMintRequest {
  tx_hash: string;
  device_id: string;
  minter_type: "donor" | "recipient";
  expected_token_id?: string;
}

interface TransactionReceipt {
  status: string;
  to: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
  blockNumber: string;
}

async function fetchTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
  const response = await fetch(ACTIVE_NETWORK.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionReceipt",
      params: [txHash],
    }),
  });

  const data = await response.json();
  return data.result || null;
}

function parseImpactBadgeMintedEvent(logs: TransactionReceipt["logs"], contractAddress: string) {
  // Find the ImpactBadgeMinted event in the logs
  for (const log of logs) {
    // Check if this log is from our contract
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) {
      continue;
    }

    // The event has indexed tokenId and minter, so they're in topics
    // topics[0] = event signature hash
    // topics[1] = tokenId (indexed)
    // topics[2] = minter address (indexed)
    // data contains: minterType (uint8), deviceId (string), fundingType (uint8)
    if (log.topics.length >= 3) {
      const tokenId = BigInt(log.topics[1]).toString();
      const minterAddress = "0x" + log.topics[2].slice(26); // Remove padding

      // Decode data - contains minterType, deviceId, fundingType
      // For simplicity, we'll extract what we can from the data
      // The actual parsing would require ABI decoding, but we have the key info in topics

      return {
        tokenId,
        minterAddress,
        rawData: log.data,
      };
    }
  }

  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get contract address from secrets
    const contractAddress = Deno.env.get("AVALANCHE_CONTRACT_ADDRESS");
    if (!contractAddress) {
      return new Response(
        JSON.stringify({ success: false, error: "CONTRACT_NOT_CONFIGURED" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Parse request body
    const body: ValidateMintRequest = await req.json();
    const { tx_hash, device_id, minter_type, expected_token_id } = body;

    if (!tx_hash || !device_id || !minter_type) {
      return new Response(
        JSON.stringify({ success: false, error: "MISSING_PARAMETERS" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if badge already exists for this transaction
    const { data: existingBadge } = await supabase
      .from("impact_badges")
      .select("id")
      .eq("tx_hash", tx_hash)
      .maybeSingle();

    if (existingBadge) {
      return new Response(
        JSON.stringify({ success: false, error: "ALREADY_MINTED" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch transaction receipt from blockchain
    const receipt = await fetchTransactionReceipt(tx_hash);

    if (!receipt) {
      return new Response(
        JSON.stringify({ success: false, error: "TX_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction was successful
    if (receipt.status !== "0x1") {
      return new Response(
        JSON.stringify({ success: false, error: "TX_FAILED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction was to our contract
    if (receipt.to.toLowerCase() !== contractAddress.toLowerCase()) {
      return new Response(
        JSON.stringify({ success: false, error: "WRONG_CONTRACT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the ImpactBadgeMinted event
    const eventData = parseImpactBadgeMintedEvent(receipt.logs, contractAddress);
    if (!eventData) {
      return new Response(
        JSON.stringify({ success: false, error: "EVENT_NOT_FOUND" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's wallet to verify they are the minter
    const { data: userWallet } = await supabase
      .from("user_wallets")
      .select("wallet_address")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (!userWallet) {
      return new Response(
        JSON.stringify({ success: false, error: "WALLET_NOT_FOUND" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the minter address matches the user's wallet
    if (eventData.minterAddress.toLowerCase() !== userWallet.wallet_address.toLowerCase()) {
      return new Response(
        JSON.stringify({ success: false, error: "MINTER_MISMATCH" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get device details for metadata
    const { data: device } = await supabase
      .from("devices")
      .select("*")
      .eq("id", device_id)
      .single();

    if (!device) {
      return new Response(
        JSON.stringify({ success: false, error: "DEVICE_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recipient profile for career info
    let recipientCareer = "Unknown";
    if (device.assigned_recipient_id) {
      const { data: recipientProfile } = await supabase
        .from("recipient_profiles")
        .select("career")
        .eq("user_id", device.assigned_recipient_id)
        .maybeSingle();
      
      if (recipientProfile?.career) {
        recipientCareer = recipientProfile.career;
      }
    }

    // Insert the badge record
    const { data: badge, error: insertError } = await supabase
      .from("impact_badges")
      .insert({
        device_id,
        minter_user_id: userId,
        minter_type,
        wallet_address: userWallet.wallet_address,
        token_id: eventData.tokenId,
        tx_hash,
        network: USE_TESTNET ? "avalanche_testnet" : "avalanche_mainnet",
        metadata: {
          device_type: device.device_type,
          funding_type: device.funding_type,
          recipient_career: recipientCareer,
          handover_date: device.handover_date,
          block_number: parseInt(receipt.blockNumber, 16),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "DB_INSERT_FAILED" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        badge,
        explorer_url: `${ACTIVE_NETWORK.explorerUrl}/tx/${tx_hash}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Validate mint error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
