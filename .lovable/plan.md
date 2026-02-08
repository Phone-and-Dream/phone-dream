
# Implementation Plan: Fix Login Redirect and Improve Dashboard Performance

## Problem 1: Login Shows Landing Page First

**Root Cause:**
After successful sign-in, the Login page sets `loginSuccess = true`, then a `useEffect` waits for `rolesLoaded` to become true before navigating. However, there's a race condition:

1. `signIn()` completes and triggers `onAuthStateChange`
2. The listener calls `fetchRoles()` with `setTimeout(..., 0)`
3. During this tiny window, the user might see the landing page flash

The issue is that `rolesLoaded` is set asynchronously after the auth state changes, and the navigation doesn't happen immediately.

**Solution:**
Instead of relying solely on `useEffect`, navigate immediately after sign-in by manually fetching and setting roles within the `signIn` function itself (similar to how `signUp` already does this). This ensures roles are loaded before the function returns, allowing immediate navigation.

### Files to Change

**1. `src/contexts/AuthContext.tsx`**
- Update `signIn` function to fetch roles immediately after successful authentication
- Set `rolesLoaded` before the function returns (just like `signUp` does)

```tsx
// Current signIn (around lines 141-153)
const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Updated signIn - fetch roles immediately
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Immediately fetch and set roles to prevent race condition
    if (data.user) {
      const userRoles = await fetchRoles(data.user.id);
      setRoles(userRoles);
      setRolesLoaded(true);
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
```

**2. `src/pages/Login.tsx`**
- Simplify navigation logic: navigate immediately after `signIn` returns successfully
- Remove dependency on `rolesLoaded` effect since roles are now loaded synchronously

```tsx
// Update handleSubmit to navigate immediately after signIn
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation ...
  
  setIsLoading(true);
  const { error } = await signIn(email, password);
  
  if (error) {
    setIsLoading(false);
    toast({ ... });
    return;
  }

  toast({ title: "Welcome back!", ... });
  
  // Navigate immediately - roles are now loaded in signIn
  if (isAdmin) {
    navigate('/admin', { replace: true });
  } else if (isDonor && isRecipient) {
    navigate('/select-role', { replace: true });
  } else if (isDonor) {
    navigate('/donor/dashboard', { replace: true });
  } else if (isRecipient) {
    navigate('/recipient/dashboard', { replace: true });
  } else {
    // Fallback based on selected role
    navigate(selectedRole === 'donor' ? '/donor/dashboard' : '/recipient/dashboard', { replace: true });
  }
};
```

Wait, there's an issue: after `signIn` returns, the component's `isDonor`, `isRecipient`, etc. won't be updated yet because React hasn't re-rendered. We need to keep the `useEffect` approach but ensure `rolesLoaded` is set synchronously in `signIn`.

**Revised approach for Login.tsx:**
- Keep the `useEffect` for navigation
- Add `setIsLoading(false)` only after navigation happens
- The key fix is in `AuthContext.tsx` where `signIn` now awaits roles before returning

---

## Problem 2: Dashboard Pages Load Slowly

**Root Cause:**
1. **Many parallel queries**: RecipientDashboard uses 11+ hooks that each make separate database calls
2. **Full-screen loader**: The entire page is blocked while loading profile data
3. **No skeleton UI**: Users see a spinner instead of a perceived-instant interface

**Solution: Progressive Loading with Skeleton UI**

Instead of blocking the entire page, show skeleton placeholders for each section and let data populate as it arrives. This creates a "progressive loading" experience.

### Files to Change

**1. Create `src/components/ui/dashboard-skeleton.tsx`**
- Create reusable skeleton components for dashboard sections

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5" />
      <div className="p-6 pt-0 -mt-12">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Skeleton className="w-24 h-24 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
```

**2. Update `src/pages/RecipientDashboard.tsx`**
- Remove the full-page loading spinner
- Show skeleton UI for sections still loading
- Render content progressively as data arrives

```tsx
// Instead of blocking the entire page:
if (isLoading) {
  return (
    <DashboardLayout role="recipient">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );
}

// Use progressive loading:
return (
  <DashboardLayout role="recipient">
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Section - show skeleton if loading */}
      {profileLoading || recipientLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* ... actual profile content ... */}
        </div>
      )}

      {/* Stats Section - show skeleton while any stat data is loading */}
      {profileLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* ... actual stats ... */}
        </div>
      )}

      {/* Skills Section */}
      {skillsLoading ? (
        <SectionSkeleton rows={2} />
      ) : skills.length > 0 && (
        <div>...</div>
      )}
      
      {/* ... etc for other sections ... */}
    </div>
  </DashboardLayout>
);
```

**3. Update `src/pages/DonorDashboard.tsx`**
- Apply the same progressive loading pattern
- Replace full-page spinner with section skeletons

**4. Optional Enhancement: Prefetch on hover**
Add prefetching when users hover over dashboard navigation links to preload data before they click.

```tsx
// In DashboardLayout.tsx, add onMouseEnter to nav links:
import { useQueryClient } from '@tanstack/react-query';

// Prefetch recipient data on hover
const prefetchRecipientData = () => {
  queryClient.prefetchQuery({ queryKey: ['profile', user?.id] });
  queryClient.prefetchQuery({ queryKey: ['recipient_profile', user?.id] });
  // ... etc
};
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Update `signIn` to fetch roles immediately before returning |
| `src/pages/Login.tsx` | Keep useEffect navigation, ensure it triggers immediately after roles load |
| `src/components/ui/dashboard-skeleton.tsx` | NEW: Create skeleton components |
| `src/pages/RecipientDashboard.tsx` | Replace full-page spinner with progressive skeleton loading |
| `src/pages/DonorDashboard.tsx` | Replace full-page spinner with progressive skeleton loading |

## Expected Results

1. **Login Flow**: User signs in → toast appears → immediately navigates to correct dashboard (no landing page flash)
2. **Dashboard Loading**: Page structure appears instantly with skeletons → data populates progressively → feels much faster
3. **Navigation Between Pages**: Users see the page structure immediately, reducing perceived wait time

## Testing Steps

1. Log out completely
2. Log in as a recipient → should go straight to recipient dashboard
3. Navigate between Portfolio, Earn XP, and Settings → should show skeletons briefly then content
4. Repeat for donor login flow
5. Test user with both donor and recipient roles → should go to role selection page
