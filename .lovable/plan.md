
# Fix: Sign Out Not Working from Dashboard

## Problem Identified

The "Sign Out" button in the **DashboardLayout** component is not actually signing out the user - it's just a link to `/login`:

```tsx
// DashboardLayout.tsx lines 93-98 - BROKEN!
<Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
  <Link to="/login">
    <LogOut className="h-4 w-4 mr-2" />
    Sign Out
  </Link>
</Button>
```

This means:
1. User clicks "Sign Out" in the dashboard sidebar
2. They navigate to `/login` but their **session is still active**
3. The home page correctly shows them as still logged in (because they are!)

The Navbar has the correct implementation - it calls `signOut()` then navigates:
```tsx
const handleSignOut = async () => {
  await signOut();
  navigate('/');
  setIsOpen(false);
};
```

## Solution

Update `DashboardLayout.tsx` to:
1. Import `useAuth` (already imported) and `useNavigate`
2. Create a `handleSignOut` function that calls `signOut()` then navigates
3. Replace the `<Link to="/login">` with a proper `<Button onClick={handleSignOut}>`

---

## File Changes

### File: `src/components/layout/DashboardLayout.tsx`

**Change 1**: Add `useNavigate` import (line 2)
```tsx
// Before:
import { Link, useLocation } from 'react-router-dom';

// After:
import { Link, useLocation, useNavigate } from 'react-router-dom';
```

**Change 2**: Add navigate and signOut hooks, plus handler function (after line 53)
```tsx
// Before:
const { user } = useAuth();

// After:
const { user, signOut } = useAuth();
const navigate = useNavigate();

const handleSignOut = async () => {
  await signOut();
  navigate('/');
};
```

**Change 3**: Replace the Sign Out button (lines 93-98)
```tsx
// Before:
<Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
  <Link to="/login">
    <LogOut className="h-4 w-4 mr-2" />
    Sign Out
  </Link>
</Button>

// After:
<Button 
  variant="ghost" 
  size="sm" 
  className="text-muted-foreground"
  onClick={handleSignOut}
>
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</Button>
```

---

## Technical Details

| Aspect | Current Behavior | Fixed Behavior |
|--------|------------------|----------------|
| Sign Out Button | Just navigates to `/login` | Calls `signOut()` which clears Supabase session |
| Session State | Remains active | Cleared from localStorage and auth context |
| Auth Context | `user` stays populated | `user` set to `null`, `roles` cleared |
| Home Page | Shows user as logged in | Shows Sign In/Get Started buttons |

## Testing Steps

1. Log in as any user (donor or recipient)
2. Navigate to the dashboard
3. Click "Sign Out" in the top right corner
4. Verify you're redirected to the home page
5. Confirm the Navbar shows "Sign In" and "Get Started" buttons (not the avatar dropdown)
6. Try navigating to a protected route (e.g., `/donor/dashboard`) - should redirect to login
