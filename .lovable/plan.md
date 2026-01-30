

# Impact Badge (SBT) System - Phase 2 Implementation Plan

## Executive Summary

This plan transforms the current admin-minted attestation system into a user-controlled Impact Badge (SBT) system on Avalanche Testnet. Users will manage their own wallets and mint their own badges, with all blockchain interactions happening client-side.

---

## Current State Analysis

**What Exists:**
- Smart contract (`ImpactSBT.sol`) with ERC-5192 soulbound functionality
- Edge function (`create-attestation`) that mints via backend private key
- `attestations` table storing tx_hash, network, metadata
- NFTBadge component displaying badges on profiles
- Device verification pipeline before matching
- Cash donations tracked separately from physical devices

**What Needs to Change:**
- Shift from admin-minting to user-minting
- Add wallet management (create, connect, export)
- Introduce new database entities (devices, user_wallets, impact_records)
- Update smart contract for user-minting with $2 AVAX fee
- Update profile display with grouped badge summaries
- Add Impact Pool funding type support

---

## Database Schema Changes

### New Tables

**1. `devices` Table**
Tracks physical devices and Impact Pool-funded devices separately from the donation workflow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| device_type | text | Laptop, Phone, Tablet, etc. |
| condition | device_condition | new, used, refurbished |
| funding_type | enum | 'physical_device' or 'impact_pool' |
| donation_id | uuid | Links to physical donation (nullable) |
| cash_donation_ids | uuid[] | Links to cash donations for Impact Pool |
| assigned_recipient_id | uuid | Recipient who received device |
| handover_date | timestamptz | When device was handed over |
| admin_confirmed | boolean | Admin confirmed delivery |
| minting_enabled | boolean | Users can now mint |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**2. `user_wallets` Table**
Stores wallet information for users.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | References auth user |
| wallet_address | text | Ethereum-style address |
| wallet_type | enum | 'created' or 'connected' |
| encrypted_seed | text | Encrypted seed phrase (only for 'created') |
| is_active | boolean | Currently active wallet |
| created_at | timestamptz | |

**3. `impact_badges` Table**
Replaces/extends attestations for the new model.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| device_id | uuid | References devices |
| minter_user_id | uuid | Who minted this badge |
| minter_type | enum | 'donor' or 'recipient' |
| wallet_address | text | Wallet that holds the SBT |
| token_id | text | On-chain token ID |
| tx_hash | text | Transaction hash |
| network | text | 'avalanche_testnet' or 'avalanche' |
| minted_at | timestamptz | |
| metadata | jsonb | Device type, funding type, career at time, etc. |

**4. `impact_pool_contributors` Table**
Links cash donors to Impact Pool devices.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| device_id | uuid | References devices |
| donor_id | uuid | References user |
| contribution_amount | numeric | Amount contributed |
| created_at | timestamptz | |

---

## Smart Contract Updates

### Updated ImpactSBT Contract

The current contract mints to recipients only. We need:

```solidity
// Key changes:
- Remove onlyOwner from mintImpactBadge (anyone can mint for themselves)
- Add minting fee: require(msg.value >= MINT_FEE, "Insufficient fee")
- Add funding_type to ImpactData struct
- Add impact_id reference
- Add separate mint functions for donors vs recipients
- Emit different events for donor/recipient mints

// Constants
uint256 public constant MINT_FEE = 0.01 ether; // ~$2 in AVAX testnet
address public feeRecipient; // Platform treasury

// New function
function mintDonorBadge(...) external payable returns (uint256)
function mintRecipientBadge(...) external payable returns (uint256)
```

Deploy to **Avalanche Fuji Testnet** first:
- RPC: `https://api.avax-test.network/ext/bc/C/rpc`
- Chain ID: 43113
- Get testnet AVAX from faucet: https://faucet.avax.network/

---

## Frontend Components

### 1. Wallet Modal Component
**File:** `src/components/WalletModal.tsx`

Three-tab modal:
1. **Create New Wallet**
   - Generate wallet using ethers.js
   - Display address + seed phrase with copy button
   - Security warning about backing up seed
   - Encrypt seed before storing

2. **Connect Existing Wallet**
   - MetaMask / Core Wallet integration
   - WalletConnect support
   - Request signature for verification
   - Store only address (no keys)

3. **Export Wallet** (only for created wallets)
   - Reveal seed phrase with password confirmation
   - Strong security warnings

### 2. Wallet Balance Display
**File:** `src/components/WalletBalance.tsx`

- Show connected wallet address
- Display AVAX balance
- Network indicator (Testnet/Mainnet)
- "Add AVAX" instructions (faucet for testnet)

### 3. Updated Impact Badges Section
**File:** `src/components/ImpactBadgesSection.tsx`

**Summary View:**
```
Impact Badges
├── 💻 Laptop Impact × 3
├── 📱 Phone Impact × 2
└── [View All]
```

**Detail View (new page):** `/profile/:id/impact-badges`
- Grid of individual badges
- Filter by device type
- For Impact Pool: "Powered by Community Donors" with [View Contributors] link

### 4. Mint Badge Flow
**File:** `src/components/MintBadgeFlow.tsx`

1. Check if wallet exists → if not, show WalletModal
2. Check AVAX balance → if low, show "Add AVAX" instructions
3. Confirm mint details (device, funding type, etc.)
4. Execute transaction (client-side)
5. Wait for confirmation
6. Store in `impact_badges` table

---

## Hooks

### useWallet Hook
```typescript
// src/hooks/useWallet.ts
export function useWallet() {
  // Get active wallet for current user
  // Create new wallet
  // Connect external wallet
  // Export wallet (decrypt seed)
  // Get AVAX balance
}
```

### useImpactBadges Hook
```typescript
// src/hooks/useImpactBadges.ts
export function useImpactBadges(userId: string) {
  // Get all badges for user
  // Get mintable devices (where minting_enabled && not yet minted by this user)
  // Group badges by device type
}

export function useMintBadge() {
  // Execute client-side mint
  // Store badge in database
}
```

### useDeviceImpact Hook
```typescript
// src/hooks/useDeviceImpact.ts
export function useDeviceImpact(deviceId: string) {
  // Get device details
  // Get funding type
  // Get contributors (for Impact Pool)
  // Get who has minted
}
```

---

## Admin Dashboard Updates

### New Admin Actions (before minting can occur):

1. **Create Device Record**
   - Manual entry for Impact Pool devices
   - Auto-created from delivered donations

2. **Assign Recipient**
   - Link device to recipient
   - Capture recipient's career at time of assignment

3. **Link Donors**
   - For physical: single donor
   - For Impact Pool: multiple contributors

4. **Confirm Handover**
   - Set handover date
   - Enable minting

### Admin Tab: "Device Impact"
- List all devices
- Status: Pending → Assigned → Delivered → Minting Enabled
- Actions per device

---

## Security Considerations

### Wallet Security
- **Created wallets**: Encrypt seed phrase with user's password before storing
- **Never store unencrypted seeds**
- Use `crypto.subtle` for encryption in browser
- Clear seed from memory after display

### RLS Policies
- Users can only read/update their own wallets
- Impact badges are publicly readable
- Only admins can enable minting on devices
- Contributors list is public for Impact Pool devices

### Client-Side Minting
- All private key operations happen in browser
- Edge function only validates and stores results
- No platform private key for user mints

---

## Testnet Configuration

**Environment Variables:**
```
AVALANCHE_USE_TESTNET=true
AVALANCHE_TESTNET_CONTRACT_ADDRESS=<deployed contract address>
```

**Frontend Config:**
```typescript
// src/lib/blockchain.ts
export const NETWORK_CONFIG = {
  testnet: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerUrl: 'https://testnet.snowtrace.io',
    faucetUrl: 'https://faucet.avax.network',
  },
  mainnet: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
  }
};
```

---

## Implementation Sequence

### Phase 2a: Database & Admin Setup
1. Create new database tables (devices, user_wallets, impact_badges, impact_pool_contributors)
2. Add RLS policies
3. Update admin dashboard with Device Impact management
4. Create admin actions for device lifecycle

### Phase 2b: Wallet System
1. Create WalletModal component
2. Implement useWallet hook
3. Add wallet management to user settings
4. Test wallet creation/connection/export

### Phase 2c: Smart Contract Update
1. Update ImpactSBT.sol with user-minting
2. Deploy to Avalanche Fuji Testnet
3. Configure testnet contract address
4. Test minting flow

### Phase 2d: Minting Flow
1. Create MintBadgeFlow component
2. Implement client-side minting
3. Add badge storage after successful mint
4. Update profile displays

### Phase 2e: Profile Updates
1. Create ImpactBadgesSection with grouping
2. Add detail page with individual badges
3. Add "View Contributors" for Impact Pool
4. Remove badges from activity feeds

---

## Improvements & Suggestions

### 1. Progressive Disclosure for Wallet Setup
Instead of requiring wallet setup upfront, only prompt when user clicks "Mint":
- Smoother UX
- Less friction for users who just want to browse

### 2. Gas Estimation Display
Before minting, show:
- Mint fee: ~$2 AVAX
- Gas estimate: ~X AVAX
- Total: ~$X

### 3. Transaction Status Tracking
Add a "Pending Mints" section that tracks:
- Submitted transactions waiting for confirmation
- Failed transactions with retry option

### 4. Faucet Integration Shortcut
For testnet, add a "Get Test AVAX" button that opens the faucet pre-filled with the user's address.

### 5. QR Code for Wallet Address
When showing "Add AVAX" instructions, display QR code for easy mobile wallet transfers.

### 6. Badge Gallery for Profiles
Create a dedicated `/impact-gallery/:userId` page that's shareable and shows all badges in a visually appealing grid.

### 7. Separate Testnet Visual Indicator
Add a prominent "TESTNET" banner when operating on testnet to prevent confusion.

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/xxx_devices_wallets.sql` | Create | New tables + RLS |
| `src/lib/blockchain.ts` | Create | Network config, contract ABIs |
| `src/lib/wallet.ts` | Create | Wallet utilities (encrypt/decrypt) |
| `src/hooks/useWallet.ts` | Create | Wallet management hook |
| `src/hooks/useImpactBadges.ts` | Create | Badge queries and minting |
| `src/components/WalletModal.tsx` | Create | Three-tab wallet modal |
| `src/components/WalletBalance.tsx` | Create | Balance display component |
| `src/components/MintBadgeFlow.tsx` | Create | Minting flow component |
| `src/components/ImpactBadgesSection.tsx` | Create | Profile badge display |
| `src/pages/ImpactBadgeDetail.tsx` | Create | Badge detail page |
| `src/pages/AdminDashboard.tsx` | Modify | Add Device Impact tab |
| `src/pages/DonorPublicProfile.tsx` | Modify | Use new badge section |
| `src/pages/RecipientPublicProfile.tsx` | Modify | Use new badge section |
| `src/pages/DonorSettings.tsx` | Modify | Add wallet management |
| `src/pages/RecipientSettings.tsx` | Modify | Add wallet management |
| `contracts/ImpactSBT.sol` | Modify | User-minting with fees |
| `supabase/functions/validate-mint/index.ts` | Create | Validate mint after tx |

---

## Dependencies to Add

```json
{
  "ethers": "^6.9.0",
  "@metamask/sdk": "^0.20.0",
  "@walletconnect/modal": "^2.6.0"
}
```

---

## Testing Checklist

- [ ] Create wallet in-app
- [ ] Connect MetaMask wallet
- [ ] Export created wallet
- [ ] Check AVAX balance
- [ ] Mint as donor (physical device)
- [ ] Mint as recipient (physical device)
- [ ] Mint for Impact Pool device
- [ ] View contributors for Impact Pool
- [ ] Profile shows grouped badges
- [ ] Detail page shows individual badges
- [ ] Admin can create device record
- [ ] Admin can enable minting
- [ ] Testnet indicator visible
- [ ] Error handling for failed transactions

