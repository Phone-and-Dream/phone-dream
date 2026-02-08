

# Fix: Complete Route Protection for Custom Domain

## Problem Identified

After analyzing the code, I found **two issues**:

### Issue 1: Missing Routes in Protection List

Several routes in `App.tsx` are **not listed** in `PREVIEW_ONLY_ROUTES`, which means they slip through the protection:

| Route | Purpose | Should be Protected? |
|-------|---------|---------------------|
| `/forgot-password` | Password recovery | Yes - requires auth system |
| `/reset-password` | Password reset | Yes - requires auth system |
| `/recipient/profile/:id` | Public profile | Maybe - depends if you want public profiles pre-launch |
| `/donor/profile/:id` | Public profile | Maybe - depends if you want public profiles pre-launch |
| `/donor/cash-donate` | Cash donation page | Yes - functional route |

### Issue 2: Catch-All Logic Flaw

The current logic at line 48-53:
```tsx
// In preview, allow preview-only routes
if (!isProduction && (isAllowedInProduction || isPreviewRoute)) {
  return <>{children}</>;
}

// For any other routes (like error pages), allow them
return <>{children}</>;  // ← This ALWAYS returns children!
```

The final `return <>{children}</>` is a **catch-all that always allows the route**, even in production! This means any route not explicitly listed anywhere slips through.

---

## Solution

### Fix 1: Add Missing Routes to Protection List

Add all functional routes to `PREVIEW_ONLY_ROUTES`:
```tsx
const PREVIEW_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/select-role',
  '/forgot-password',      // ADD
  '/reset-password',       // ADD
  '/donor/register',
  '/donor/donate',
  '/donor/dashboard',
  '/donor/settings',
  '/donor/cash-donate',    // ADD
  '/donor/profile',        // ADD (for /donor/profile/:id)
  '/recipient/apply',
  '/recipient/apply/success',
  '/recipient/dashboard',
  '/recipient/tasks',
  '/recipient/settings',
  '/recipient/profile',    // ADD (for /recipient/profile/:id)
  '/dream-board',
  '/leaderboard',
  '/admin/login',
  '/admin',
];
```

### Fix 2: Fix the Catch-All Logic

Change the final return to redirect unknown routes in production:
```tsx
export function PrelaunchRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isProduction = isProductionEnvironment();
  
  const isAllowedInProduction = PRODUCTION_ALLOWED_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  const isPreviewRoute = PREVIEW_ONLY_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  // In production, ONLY allow explicitly allowed routes
  if (isProduction) {
    if (isAllowedInProduction) {
      return <>{children}</>;
    }
    // Everything else redirects to coming-soon
    return <Navigate to="/coming-soon" replace />;
  }
  
  // In preview/development, allow all routes
  return <>{children}</>;
}
```

This is a much simpler and safer logic:
- **Production**: Only allow `/` and `/coming-soon`, redirect everything else
- **Preview**: Allow everything

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/PrelaunchRoute.tsx` | Simplify logic + add missing routes |

## Complete Updated Code

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { isProductionEnvironment } from '@/lib/environment';

// Routes allowed in production (pre-launch)
const PRODUCTION_ALLOWED_ROUTES = ['/', '/coming-soon'];

export function PrelaunchRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Check if we're in production (published site or custom domain)
  const isProduction = isProductionEnvironment();
  
  // In production, only allow specific routes
  if (isProduction) {
    const isAllowedInProduction = PRODUCTION_ALLOWED_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
    
    if (isAllowedInProduction) {
      return <>{children}</>;
    }
    
    // Redirect all other routes to coming-soon
    return <Navigate to="/coming-soon" replace />;
  }
  
  // In preview/development, allow all routes
  return <>{children}</>;
}
```

This removes the `PREVIEW_ONLY_ROUTES` list entirely since we don't need it - in production we have a whitelist, in preview we allow everything.

---

## Testing Steps

After publishing:

1. Visit `aphoneandadream.com` → Should show landing page
2. Visit `aphoneandadream.com/coming-soon` → Should show coming soon page
3. Visit `aphoneandadream.com/login` → Should redirect to `/coming-soon`
4. Visit `aphoneandadream.com/donor/dashboard` → Should redirect to `/coming-soon`
5. Visit `aphoneandadream.com/forgot-password` → Should redirect to `/coming-soon`
6. Click "Donate a Device" button → Should go to `/coming-soon`

In preview (id-preview--*.lovable.app):
1. All routes should work normally for testing

