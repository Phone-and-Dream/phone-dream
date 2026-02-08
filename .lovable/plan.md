
# Implementation Plan: Fix Navbar to Use Real Auth Links on /dev

## Problem
You're on the `/dev` page which has working CTA buttons in the page content, but the **Navbar** at the top still links "Sign In" and "Get Started" to `/coming-soon` instead of `/login` and `/signup`.

## Solution
Update the Navbar component to detect when it's on the `/dev` route and use real authentication links.

## Changes Required

### File: `src/components/layout/Navbar.tsx`

**What we'll change:**
The Navbar currently has hardcoded links:
- "Sign In" → `/coming-soon`
- "Get Started" → `/coming-soon`

We'll make it context-aware:
- On `/dev` route: "Sign In" → `/login`, "Get Started" → `/signup`
- On other routes: Keep current behavior (`/coming-soon`)

**Technical approach:**
1. Use the existing `location` from `useLocation()` (already imported)
2. Check if `location.pathname === '/dev'`
3. Conditionally set the link destinations

**Code changes:**
```tsx
// Add after line 48 (const isLoggedIn = !!user;)
const isDevRoute = location.pathname === '/dev';

// Update desktop buttons (around lines 130-136)
// Change: <Link to="/coming-soon">Sign In</Link>
// To: <Link to={isDevRoute ? "/login" : "/coming-soon"}>Sign In</Link>

// Change: <Link to="/coming-soon">Get Started</Link>
// To: <Link to={isDevRoute ? "/signup" : "/coming-soon"}>Get Started</Link>

// Update mobile buttons (around lines 207-211)
// Same pattern for mobile menu
```

## Result After Implementation

| Route | "Sign In" goes to | "Get Started" goes to |
|-------|-------------------|----------------------|
| `/` (Landing) | `/coming-soon` | `/coming-soon` |
| `/dev` (Index) | `/login` | `/signup` |

## How to Test
1. Navigate to `/dev`
2. Click "Sign In" in the Navbar → should go to `/login`
3. Click "Get Started" in the Navbar → should go to `/signup`
4. Navigate to `/` (Landing page)
5. Verify buttons still go to `/coming-soon`

## Optional: Add /dev to PrelaunchRoute allowed list
Currently, `/dev` is **not** in the `ALLOWED_ROUTES` list in `PrelaunchRoute.tsx`. This means if you publish the site, `/dev` would redirect to `/coming-soon` in production.

If you want `/dev` accessible on the published site for internal testing, I can also add it to the allowed routes list. Let me know!
