
# Implementation Plan: Update Landing CTAs to Signup Flow & Remove /dev Route

## Problem
The landing page currently directs users to `/donor/register` and `/recipient/apply` in Preview mode, but these routes require existing accounts. Additionally, the `/dev` route is now redundant since the main landing page works in Preview mode.

## Solution
1. Update landing page CTA buttons to route to `/signup` with role pre-selection query parameters
2. Add query parameter detection to the Signup form to auto-select the role
3. Remove the `/dev` route from the app and delete the unused Index.tsx file

## Files to Change

### 1. `src/pages/Landing.tsx`
**Changes:**
- Line 139: Change button link from `"/donor/register"` to `"/signup?role=donor"`
- Line 145: Change button link from `"/recipient/apply"` to `"/signup?role=recipient"`
- Line 358: Change button link from `"/donor/register"` to `"/signup?role=donor"`

**Result:** All "Donate a Device" buttons lead to `/signup?role=donor` and "I Need a Device" buttons lead to `/signup?role=recipient` in Preview mode.

### 2. `src/pages/Signup.tsx`
**Changes:**
- Import `useSearchParams` from react-router-dom (update line 2)
- Add `const [searchParams] = useSearchParams();` after the navigate hook (line 17)
- Add a new `useEffect` hook after the validation helpers that reads the `role` query parameter and pre-selects it:
  ```tsx
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'donor' || roleParam === 'recipient') {
      setRole(roleParam);
    }
  }, [searchParams]);
  ```

**Result:** When users click a CTA button with `?role=donor` or `?role=recipient`, the signup form automatically selects that role, streamlining the user flow.

### 3. `src/App.tsx`
**Changes:**
- Remove the import: `import Index from "./pages/Index";` (line 8)
- Remove the route: `<Route path="/dev" element={<Index />} />` (line 56)

**Result:** The `/dev` route no longer exists; all routes now use the main landing page.

### 4. `src/pages/Index.tsx`
**Changes:**
- Delete this file entirely (no longer needed)

### 5. `src/components/PrelaunchRoute.tsx` (optional cleanup)
**Changes:**
- The `/dev` route is not in the `PREVIEW_ONLY_ROUTES` array currently, so no changes needed here.

## User Flow After Implementation

**In Preview Mode:**
- Landing page → "Donate a Device" → `/signup?role=donor` → Signup form auto-selects "I want to donate"
- Landing page → "I Need a Device" → `/signup?role=recipient` → Signup form auto-selects "I need a device"
- Navbar → "Get Started" → `/signup` → User manually selects role
- `/dev` route → Returns 404 (no longer exists)

**In Production Mode:**
- All buttons remain locked to `/coming-soon`

## Benefits
- Streamlined signup flow: users immediately see their selected role pre-filled
- Reduced friction: fewer clicks to reach the signup form
- Cleaner codebase: removes the now-unnecessary `/dev` route and Index.tsx file
- Consistent behavior: the main landing page now works the same in Preview and Production (with different link destinations)

## Testing Steps
1. Navigate to `/` in Preview mode
2. Click "Donate a Device" → should go to `/signup?role=donor` with donor role pre-selected
3. Click "I Need a Device" → should go to `/signup?role=recipient` with recipient role pre-selected
4. Try navigating directly to `/dev` → should return 404 or redirect
5. Verify production site still shows all buttons redirecting to `/coming-soon`
