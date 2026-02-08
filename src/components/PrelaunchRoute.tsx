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
