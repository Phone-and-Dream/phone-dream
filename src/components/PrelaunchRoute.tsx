import { Navigate, useLocation } from 'react-router-dom';

// Routes that are accessible in pre-launch mode (production)
const ALLOWED_ROUTES = ['/', '/coming-soon'];

export function PrelaunchRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Check if we're in production (published site)
  // The preview URL contains 'preview' in the hostname
  const isPreview = typeof window !== 'undefined' && 
    (window.location.hostname.includes('preview') || 
     window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1');
  
  const isProduction = !isPreview;
  
  // Check if current route is allowed
  const isAllowed = ALLOWED_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  // In production, redirect non-allowed routes to coming-soon
  if (isProduction && !isAllowed) {
    return <Navigate to="/coming-soon" replace />;
  }
  
  return <>{children}</>;
}
