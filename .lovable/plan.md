
# Fix: Allow Donors to Update Their Own Donations

## Problem

When donors submit their device for verification, they receive the error:
> "Unable to submit - donation may have already been submitted or is in an invalid state."

This happens because the database is missing an RLS (Row Level Security) policy that allows donors to update their own donations. Currently, only admins can update donations.

## Solution

Add a new RLS policy to allow donors to update their own donations when the donation is in `draft` or `verification_rejected` status.

## Database Changes

Add one new RLS policy:

```sql
CREATE POLICY "Donors can update their own draft donations"
ON public.donations
FOR UPDATE
TO authenticated
USING (auth.uid() = donor_id AND status IN ('draft', 'verification_rejected'))
WITH CHECK (auth.uid() = donor_id);
```

This policy allows:
- Donors to update only their own donations (where `donor_id` matches their user ID)
- Updates only when the donation is in a modifiable state (`draft` or `verification_rejected`)
- This is a security-conscious approach that prevents donors from modifying donations after they've been submitted for verification

## Why This Is Safe

| Concern | Mitigation |
|---------|------------|
| Donors modifying verified donations | Policy only allows updates when status is `draft` or `verification_rejected` |
| Donors modifying other users' donations | Policy requires `donor_id = auth.uid()` |
| Donors changing status to arbitrary values | The application logic controls what status changes are valid |

## Files Changed

No code changes required - only a database migration to add the RLS policy.

## Expected Outcome

After this change, when a donor clicks "Submit for Verification":
1. The `useSubmitForVerification` hook will successfully update the donation status
2. The donation moves from `draft` to `media_submitted`
3. The success toast appears and the donor is redirected to their dashboard
