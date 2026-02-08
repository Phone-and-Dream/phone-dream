
# Implementation Plan: Add Separate Routes for Landing Page and Index Page

## Summary
Add a new route so you can access both the current Landing page and the original Index page. This will let you navigate between them anytime for previewing and working on different things.

## Current State
- **Landing page** (`src/pages/Landing.tsx`) → Currently at `/` route
- **Index page** (`src/pages/Index.tsx`) → Not connected to any route (orphaned)

## Solution
Add a new `/dev` route for the Index page so you can access both:

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing.tsx | Main landing page (public-facing) |
| `/dev` | Index.tsx | Development/testing blank page |

## Changes Required

### File: `src/App.tsx`

1. **Add import for Index page** (line 9):
   ```tsx
   import Index from "./pages/Index";
   ```

2. **Add new route** (after line 54):
   ```tsx
   <Route path="/dev" element={<Index />} />
   ```

## How to Navigate
After implementation:
- **Landing page**: Visit `/` or click the logo
- **Index/Dev page**: Visit `/dev` in the URL bar

## Alternative Option
If you prefer, I could rename the routes differently:
- `/landing` → Landing page  
- `/` → Index page (original blank page as home)

Let me know if you'd prefer this alternative approach instead!

## Result
- Both pages accessible via separate routes
- No changes to Landing.tsx content
- Easy to switch between them during development
- PrelaunchRoute will still work (you may need to add `/dev` to allowed routes if testing in production)
