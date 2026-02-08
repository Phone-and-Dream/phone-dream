
## Goal
Make sure **any visit on your custom domain** is treated as “production (pre-launch)” so routes like `/login` always redirect to `/coming-soon`, even if hostname matching or CDN caching behaves unexpectedly.

## What I found (from the codebase)
- `PrelaunchRoute` is correct now: in production it whitelists only `['/', '/coming-soon']` and redirects everything else.
- The only realistic reason `/login` would still be accessible on the custom domain is:  
  **`isProductionEnvironment()` is evaluating to `false` on that domain**, so the app thinks it’s in preview/development and allows all routes.
- Current `isProductionEnvironment()` is **allowlist-based** (only returns true if the hostname matches one of the entries). Even a small mismatch (different subdomain, trailing dot, alternate host, etc.) will break production detection.

## Likely root causes (non-code + code)
1. **Hostname mismatch** on the custom domain (e.g., you’re actually on `www.`, a different subdomain, or a forwarded hostname).
2. **Stale cached build** served on the custom domain (the older build still uses the older “lovable.app-only” check).
3. **Environment detection too strict** (allowlist doesn’t cover every possible hostname form).

## Implementation approach
### 1) Make production detection robust (recommended)
Update `src/lib/environment.ts` so production is determined by **“not preview and not local/dev”** rather than a brittle hostname allowlist.

New logic concept:
- Return **false** for:
  - Preview URLs: hostname contains `id-preview--`
  - Local dev: `localhost`, `127.0.0.1`
  - Lovable editor sandbox domain: ends with `.lovableproject.com` (used by the in-editor environment)
- Return **true** for everything else (includes published domain + any custom domain)

This guarantees:
- Custom domains always behave as production, without needing to keep updating a list.
- Preview continues to behave as preview.

### 2) (Optional but very helpful) Add a debug switch to verify what the app thinks
Add a small debug log that only triggers when `?debugEnv=1` is present:
- Logs:
  - `hostname`
  - computed `isProduction`
  - why it was classified that way (preview/local/sandbox/production)

This helps confirm in 30 seconds whether the issue is caching or classification.

## Files to change
1. `src/lib/environment.ts`
   - Replace current `PRODUCTION_HOSTNAMES` allowlist approach with robust detection.
   - (Optional) add debug logging when `debugEnv=1`.

No changes needed to `PrelaunchRoute.tsx` (it already enforces the redirect correctly as long as `isProductionEnvironment()` returns true).

## Test plan (very specific)
After publishing the updated frontend:
1. Open an **incognito/private** window (to avoid cached JS).
2. Visit:
   - `https://aphoneandadream.com/login?debugEnv=1`
3. Expected:
   - It should redirect to `https://aphoneandadream.com/coming-soon`
4. If debug logging is enabled, open browser devtools console and confirm it logs:
   - hostname = `aphoneandadream.com` (or whatever it truly is)
   - isProduction = `true`
5. Confirm preview still works:
   - Preview URL `/login` should remain accessible (no redirect).

## Rollback / safety
- This change only affects environment classification; it does not touch authentication, database, or routing structure.
- Preview URLs remain explicitly excluded, so development/testing won’t get locked.

## If it still doesn’t work after this
That would strongly indicate the **custom domain is serving an older cached build**. In that case, we’ll:
- Verify the hostname being served (via the debug switch).
- Add an additional “build version” string in the UI (visible only with `?debugEnv=1`) so you can confirm the custom domain is running the newest publish.
