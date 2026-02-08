// List of production hostnames
// Preview URLs contain 'id-preview--' and are NOT considered production
const PRODUCTION_HOSTNAMES = [
  'dream-device-connect.lovable.app',
  // Custom domains - add yours here:
  'aphoneandadream.com',
  'www.aphoneandadream.com',
];

/**
 * Determines if the app is running in a production environment.
 * Returns true for published Lovable apps and custom domains.
 * Returns false for preview URLs (id-preview--*.lovable.app) and localhost.
 */
export function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Preview URLs are NOT production (they contain 'id-preview--')
  if (hostname.includes('id-preview--')) return false;
  
  // Check if hostname matches any production hostname
  return PRODUCTION_HOSTNAMES.some(prodHost => 
    hostname === prodHost || hostname.endsWith('.' + prodHost)
  );
}
