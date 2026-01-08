import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'donor' | 'recipient' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isDonor, isRecipient, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const hasRole = 
      (requiredRole === 'donor' && isDonor) ||
      (requiredRole === 'recipient' && isRecipient) ||
      (requiredRole === 'admin' && isAdmin);

    if (!hasRole) {
      // Redirect to appropriate dashboard based on their actual role
      if (isDonor) {
        return <Navigate to="/donor/dashboard" replace />;
      } else if (isRecipient) {
        return <Navigate to="/recipient/dashboard" replace />;
      } else if (isAdmin) {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
