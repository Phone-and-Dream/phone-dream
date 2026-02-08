
# Implementation Plan: Enable Working Auth Links in Preview Environment

## Problem
Currently, the Landing page (`/`) has all CTA buttons hardcoded to `/coming-soon`. The Navbar was updated to use `/dev` route detection, but users on the main landing page (`/`) are still stuck. The `PrelaunchRoute.tsx` already has environment detection logic that distinguishes between Preview and Production environments.

## Solution
Implement environment-based routing in both `Navbar.tsx` and `Landing.tsx` to enable real authentication links in the **Preview environment only**, while keeping all links pointing to `/coming-soon` in **Production**.

## Files to Change

### 1. File: `src/components/layout/Navbar.tsx`
**What's changing:** Replace the `isDevRoute` path-based check with environment-based detection.

**Current logic:**
```
const isDevRoute = location.pathname === '/dev';
// Uses isDevRoute in Sign In/Get Started links
```

**New logic:**
```
const isPreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('preview') || 
   window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

// Use isPreview in Sign In/Get Started links
```

**Button updates:**
- Line 132: `to={isDevRoute ? "/login" : "/coming-soon"}` → `to={isPreview ? "/login" : "/coming-soon"}`
- Line 135: `to={isDevRoute ? "/signup" : "/coming-soon"}` → `to={isPreview ? "/signup" : "/coming-soon"}`
- Line 209: `to={isDevRoute ? "/login" : "/coming-soon"}` → `to={isPreview ? "/login" : "/coming-soon"}`
- Line 212: `to={isDevRoute ? "/signup" : "/coming-soon"}` → `to={isPreview ? "/signup" : "/coming-soon"}`

### 2. File: `src/pages/Landing.tsx`
**What's changing:** Add environment detection and use it to conditionally route CTA buttons.

**Locations to update:**
1. Hero section - "Donate a Device" button (line 135)
2. Hero section - "I Need a Device" button (line 141)  
3. Final CTA section - "Donate a Device" button (line 354)
4. Final CTA section - "Browse Dream Board" button (line 357)

**New logic:**
```typescript
const isPreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('preview') || 
   window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');
```

**Button mapping (in Preview mode):**
- "Donate a Device" → `/donor/register`
- "I Need a Device" → `/recipient/apply`
- "Browse Dream Board" → `/dream-board`

**Button mapping (in Production mode):**
- All buttons → `/coming-soon`

## Result After Implementation

| Environment | Route | Links | Behavior |
|-------------|-------|-------|----------|
| **Preview** (dev/testing) | `/` | `/login`, `/signup`, `/donor/register`, `/recipient/apply`, `/dream-board` | Full access to auth flows |
| **Production** (published) | `/` | `/coming-soon` | All buttons locked to coming-soon |
| **Preview** | `/dev` | `/login`, `/signup` | Still works via navbar |
| **Production** | `/dev` | `/coming-soon` | Redirects to coming-soon via PrelaunchRoute |

## How This Works Together
1. **PrelaunchRoute.tsx** already handles route-level access control (production users can only access `/` and `/coming-soon`)
2. **Navbar.tsx** will detect environment and conditionally set button destinations
3. **Landing.tsx** will detect environment and conditionally set CTA button destinations
4. The environment detection logic reuses the same pattern already in `PrelaunchRoute.tsx` for consistency

## Testing Steps
1. In Preview mode, navigate to `/`
2. Click "Donate a Device" → should go to `/donor/register`
3. Click "I Need a Device" → should go to `/recipient/apply`
4. Click "Browse Dream Board" in final CTA → should go to `/dream-board`
5. Click Sign In/Get Started in navbar → should go to `/login` / `/signup`
6. In Production (after publishing), verify all buttons still go to `/coming-soon`
