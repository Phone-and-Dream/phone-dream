import { Navigate, useLocation } from 'react-router-dom';
import { isProductionEnvironment } from '@/lib/environment';

// Routes that are accessible in preview mode (can be expanded for development)
// Production mode only allows '/' and '/coming-soon'
const PREVIEW_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/select-role',
  '/donor/register',
  '/donor/donate',
  '/donor/dashboard',
  '/donor/settings',
  '/recipient/apply',
  '/recipient/apply/success',
  '/recipient/dashboard',
  '/recipient/tasks',
  '/recipient/settings',
  '/dream-board',
  '/leaderboard',
  '/admin/login',
  '/admin',
];

const PRODUCTION_ALLOWED_ROUTES = ['/', '/coming-soon'];

export function PrelaunchRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Check if we're in production (published site or custom domain)
  const isProduction = isProductionEnvironment();
  
  // Check if current route is allowed
  const isAllowedInProduction = PRODUCTION_ALLOWED_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  const isPreviewRoute = PREVIEW_ONLY_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  // In production, redirect non-allowed routes to coming-soon
  if (isProduction && !isAllowedInProduction) {
    return <Navigate to="/coming-soon" replace />;
  }
  
  // In preview, allow preview-only routes
  if (!isProduction && (isAllowedInProduction || isPreviewRoute)) {
    return <>{children}</>;
  }
  
  // For any other routes (like error pages), allow them
  return <>{children}</>;
}
