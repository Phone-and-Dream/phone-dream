
# Add Donation Type Selection to Dream Board Modal

## Overview

Currently, when a donor clicks "Donate to this recipient" on the Dream Board modal, they are taken directly to the device donation form. This change will add an intermediate step allowing donors to choose between **cash donation** or **physical device donation** before proceeding.

## Current Flow
```text
Dream Board Card → [Donate] → Modal Overview → [Donate to this recipient] → Device Form
```

## New Flow
```text
Dream Board Card → [Donate] → Modal Overview → [Donate to this recipient] → Donation Type Selection → Cash Flow OR Device Form
```

## Implementation Details

### File: `src/components/DonationModal.tsx`

**Changes:**

1. **Add new step type**: Extend the `DonationStep` type to include `'choice'` step:
   ```typescript
   type DonationStep = 'overview' | 'choice' | 'form' | 'media' | 'confirm' | 'success' | 'cash';
   ```

2. **Add cash donation state**: Track when user selects cash donation:
   ```typescript
   const [showCashFlow, setShowCashFlow] = useState(false);
   ```

3. **Update "Donate to this recipient" button**: Change from going directly to `'form'` to going to `'choice'` step:
   ```typescript
   // Before
   onClick={() => setStep('form')}
   
   // After
   onClick={() => setStep('choice')}
   ```

4. **Add new choice step UI**: Create a step that presents two cards similar to `DonorDonateChoice.tsx`:
   - **Donate a Device** card - continues to `'form'` step
   - **Donate Cash** card - continues to `'cash'` step (renders CashDonationFlow inline)

5. **Integrate CashDonationFlow component**: When cash is selected, render the `CashDonationFlow` component with the recipient pre-selected:
   ```typescript
   <CashDonationFlow 
     preSelectedRecipient={{
       id: request.recipient_id,
       name: recipientName,
       avatar_url: recipientAvatar
     }}
     preSelectedDream={{
       id: request.id,
       device_needed: request.device_needed,
       purpose: request.purpose,
       recipient_id: request.recipient_id,
       recipient_name: recipientName
     }}
     onClose={handleClose}
   />
   ```

6. **Update handleClose**: Reset the choice step and cash flow state on modal close.

### Visual Design

The choice step will display:
- A header: "How would you like to support {recipientName}?"
- Two side-by-side cards matching the design from `DonorDonateChoice.tsx`:
  - **Device card**: Gift icon, "Donate a Device" title, brief benefits list
  - **Cash card**: DollarSign icon, "Donate Cash" title, brief benefits list
- A "Back" button to return to overview

---

## Technical Details

### Import Changes
Add `CashDonationFlow` import:
```typescript
import { CashDonationFlow } from '@/components/CashDonationFlow';
```

### State Changes
```typescript
// Add to existing state declarations (~line 40-60)
type DonationStep = 'overview' | 'choice' | 'form' | 'media' | 'confirm' | 'success' | 'cash';
```

### New renderStep Case
Add `case 'choice':` and `case 'cash':` to the switch statement in `renderStep()`.

### Files Modified
| File | Changes |
|------|---------|
| `src/components/DonationModal.tsx` | Add choice step, cash step, integrate CashDonationFlow |

### Dependencies
- Uses existing `CashDonationFlow` component (already supports pre-selected recipient/dream)
- Uses existing UI components (Card, Button, icons from lucide-react)
- No database changes required
