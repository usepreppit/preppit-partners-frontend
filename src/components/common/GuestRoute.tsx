import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * GuestRoute component - Restricts access to non-authenticated users only
 * Redirects authenticated users to dashboard based on account type
 */
export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-brand-500"></div>
      </div>
    );
  }

  // Redirect to appropriate dashboard if already authenticated
  if (isAuthenticated) {
    const accountType = (user?.account_type || 'partner').toLowerCase();
    const dashboardPath = accountType === 'admin' ? '/admin-dashboard' : '/partner-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Render guest content (login, signup, etc.)
  return <>{children}</>;
}
