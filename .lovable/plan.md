
# Implementation Plan: Validate-Mint Edge Function + Testnet UI Enhancements

## Overview

This plan implements two key features:
1. **Validate-Mint Edge Function** - Verifies client-side blockchain transactions and stores badge data securely
2. **Testnet Indicator Banner** - A persistent visual indicator when operating on testnet to prevent user confusion

---

## Part A: Validate-Mint Edge Function

### Purpose
When users mint badges client-side, we need a secure backend function to:
- Verify the transaction actually occurred on-chain
- Validate the transaction parameters match the expected values
- Store the badge record in the database with verified data
- Prevent fake/spoofed badge submissions

### Architecture

```text
User Client                    Edge Function                 Blockchain
     |                              |                            |
     |---(1) Submit txHash -------->|                            |
     |                              |---(2) Fetch tx receipt --->|
     |                              |<---(3) Receipt data -------|
     |                              |                            |
     |                              |---(4) Verify:              |
     |                              |    - tx success            |
     |                              |    - correct contract      |
     |                              |    - event data matches    |
     |                              |                            |
     |                              |---(5) Store in DB          |
     |<--(6) Return badge data -----|                            |
```

### Edge Function: `validate-mint`

**File:** `supabase/functions/validate-mint/index.ts`

**Request Body:**
```typescript
{
  tx_hash: string;          // Transaction hash from client
  device_id: string;        // Device being minted
  minter_type: 'donor' | 'recipient';
  expected_token_id?: string; // Optional: client-parsed token ID
}
```

**Response:**
```typescript
{
  success: boolean;
  badge?: {
    id: string;
    device_id: string;
    token_id: string;
    tx_hash: string;
    // ... full badge data
  };
  error?: string;
}
```

**Validation Steps:**
1. Authenticate user via JWT
2. Fetch transaction receipt from Avalanche RPC
3. Verify transaction was successful (status = 1)
4. Verify transaction was to our contract address
5. Parse ImpactBadgeMinted event from logs
6. Verify device_id and minter_type match event data
7. Check if badge already exists (prevent duplicates)
8. Insert badge record into `impact_badges` table
9. Return the created badge

### Config Update

**File:** `supabase/config.toml`
```toml
[functions.validate-mint]
verify_jwt = false
```

### Hook Update

**File:** `src/hooks/useImpactBadges.ts`

After successful on-chain mint, call the edge function to validate and store:
```typescript
// After tx.wait() succeeds
const response = await supabase.functions.invoke('validate-mint', {
  body: { tx_hash: receipt.hash, device_id: device.id, minter_type }
});
```

This replaces the current direct database insert, adding a security layer.

---

## Part B: Testnet Indicator Banner

### Purpose
Add a prominent, persistent banner when the app is running on testnet to:
- Prevent user confusion about real vs test transactions
- Clearly indicate when badges/transactions are on testnet
- Provide quick access to the faucet

### New Component: `TestnetBanner`

**File:** `src/components/TestnetBanner.tsx`

A sticky banner that appears at the top of the page when `USE_TESTNET = true`:
- Yellow/amber styling for visibility
- Shows "TESTNET MODE" with network name
- Faucet link button
- Can be minimized/dismissed per session

### Layout Integration

**Files to modify:**
- `src/components/layout/DashboardLayout.tsx` - Add banner above header
- `src/components/layout/Navbar.tsx` - Add banner for public pages

### Visual Design

```text
┌────────────────────────────────────────────────────────────┐
│ ⚠️ TESTNET MODE - Avalanche Fuji | [Get Test AVAX] [Hide] │
└────────────────────────────────────────────────────────────┘
```

Features:
- Fixed position at top of viewport
- Yellow/amber background with warning icon
- Network name displayed
- "Get Test AVAX" button opens faucet
- "Hide" button minimizes to a small indicator in corner
- State persisted in sessionStorage (not localStorage - resets on new tab)

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/validate-mint/index.ts` | Create | Edge function for transaction verification |
| `supabase/config.toml` | Modify | Add validate-mint function config |
| `src/components/TestnetBanner.tsx` | Create | Persistent testnet indicator |
| `src/hooks/useImpactBadges.ts` | Modify | Call validate-mint instead of direct insert |
| `src/components/layout/DashboardLayout.tsx` | Modify | Add TestnetBanner |
| `src/components/layout/Navbar.tsx` | Modify | Add TestnetBanner for public pages |

---

## Technical Details

### Edge Function Security

The validate-mint function:
1. Uses `getClaims()` to verify the JWT and get user ID
2. Only allows the transaction sender to submit their own mints
3. Verifies on-chain data matches submitted data
4. Prevents duplicate submissions with database constraints

### Testnet Detection

Current implementation uses a hardcoded constant:
```typescript
export const USE_TESTNET = true;
```

The TestnetBanner component will import this and conditionally render.

### Error Handling

The edge function will return specific error codes:
- `TX_NOT_FOUND` - Transaction hash doesn't exist
- `TX_FAILED` - Transaction reverted on-chain
- `WRONG_CONTRACT` - Transaction was to a different contract
- `EVENT_MISMATCH` - Event data doesn't match parameters
- `ALREADY_MINTED` - Badge already exists for this device/user
- `UNAUTHORIZED` - User not authenticated or not the minter

---

## Implementation Sequence

1. Create `validate-mint` edge function
2. Update `supabase/config.toml` with function config
3. Modify `useImpactBadges.ts` to use the edge function
4. Create `TestnetBanner` component
5. Integrate banner into `DashboardLayout`
6. Integrate banner into `Navbar`
7. Test complete minting flow with validation
8. Verify testnet banner appears correctly

---

## Additional UI Polish

While implementing the banner, I'll also add:

1. **Network badge in wallet display** - Already exists in WalletBalance, will ensure consistency

2. **Faucet pre-fill** - The faucet link will include the user's wallet address when available:
   ```typescript
   const faucetUrl = `${network.faucetUrl}?address=${walletAddress}`;
   ```

3. **Transaction pending indicator** - Show a subtle loading state while validate-mint runs after the on-chain transaction completes

4. **Better error messages** - More user-friendly error messages for common blockchain errors (insufficient funds, user rejected, network issues)
