/**
 * Determines if the app is running in a production environment.
 * 
 * Logic: Returns TRUE by default, EXCEPT for known non-production patterns:
 * - Preview URLs (contain 'id-preview--')
 * - Local development (localhost, 127.0.0.1)
 * - Lovable editor sandbox (ends with .lovableproject.com)
 * 
 * This ensures custom domains always behave as production without
 * needing to maintain a hostname allowlist.
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  const searchParams = new URLSearchParams(window.location.search);
  const debugMode = searchParams.get('debugEnv') === '1';
  
  // Check for non-production patterns
  const isPreview = hostname.includes('id-preview--');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isSandbox = hostname.endsWith('.lovableproject.com');
  
  // Production = NOT any of the above
  const isProduction = !isPreview && !isLocalhost && !isSandbox;
  
  // Debug logging when ?debugEnv=1 is present
  if (debugMode) {
    const reason = isPreview ? 'preview' : isLocalhost ? 'localhost' : isSandbox ? 'sandbox' : 'production';
    console.log('[Environment Debug]', {
      hostname,
      isProduction,
      reason,
      buildTime: new Date().toISOString().slice(0, 16), // Helps identify cached builds
    });
  }
  
  return isProduction;
}
