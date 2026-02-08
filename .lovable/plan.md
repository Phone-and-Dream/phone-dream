
# Fix: Custom Domain Production Detection

## Problem

The current production detection only checks for `lovable.app` in the hostname:

```tsx
const isProduction = typeof window !== 'undefined' && 
  window.location.hostname.includes('lovable.app');
```

When you use your custom domain, this check fails because the hostname no longer contains `lovable.app`. As a result:
- The app thinks it's in "preview mode"
- All routes become accessible instead of redirecting to `/coming-soon`
- CTA buttons link to functional routes instead of `/coming-soon`

## Solution

Update the production detection logic to also recognize your custom domain. We need to modify **3 files** that contain this logic:

1. `src/components/PrelaunchRoute.tsx` - Controls route access/redirects
2. `src/pages/Landing.tsx` - Controls CTA button destinations  
3. `src/components/layout/Navbar.tsx` - Controls Sign In/Get Started button destinations

## Implementation

### Create a shared utility for consistency

To avoid duplicating the logic and make it easy to add more domains later, we'll create a small utility function:

**New file: `src/lib/environment.ts`**
```tsx
// List of production hostnames (add your custom domain here)
const PRODUCTION_HOSTNAMES = [
  'lovable.app',
  'dream-device-connect.lovable.app',
  // Add your custom domain here:
  'aphoneandadream.com',
  'www.aphoneandadream.com',
];

export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  return PRODUCTION_HOSTNAMES.some(prodHost => 
    hostname === prodHost || hostname.endsWith('.' + prodHost)
  );
}
```

### Update the 3 files to use the shared utility

**1. `src/components/PrelaunchRoute.tsx`**
- Import `isProductionEnvironment` from the new utility
- Replace inline check with `const isProduction = isProductionEnvironment();`

**2. `src/pages/Landing.tsx`**
- Import `isProductionEnvironment` from the new utility
- Replace inline check with `const isProduction = isProductionEnvironment();`

**3. `src/components/layout/Navbar.tsx`**
- Import `isProductionEnvironment` from the new utility
- Replace inline check with `const isProduction = isProductionEnvironment();`

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/environment.ts` | **NEW** - Create shared utility with your custom domain |
| `src/components/PrelaunchRoute.tsx` | Use shared `isProductionEnvironment()` |
| `src/pages/Landing.tsx` | Use shared `isProductionEnvironment()` |
| `src/components/layout/Navbar.tsx` | Use shared `isProductionEnvironment()` |

## What You'll Need to Provide

**Your custom domain name** - I'll need to know the exact domain you've configured (e.g., `aphoneandadream.com`) to add it to the production hostnames list.

## Result

After this change:
- Your custom domain will be recognized as production
- Routes like `/login`, `/signup`, `/donor/dashboard` will redirect to `/coming-soon`
- CTA buttons will link to `/coming-soon` instead of functional routes
- The Lovable preview (`id-preview--*.lovable.app`) will continue to work normally for testing

## Testing Steps

1. Visit your custom domain
2. Try navigating to `/login` directly → should redirect to `/coming-soon`
3. Click "Donate a Device" on landing page → should go to `/coming-soon`
4. Click "I Need a Device" → should go to `/coming-soon`
5. Verify the Lovable preview URL still allows access to all routes for testing
