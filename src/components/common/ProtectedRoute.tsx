import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component - Restricts access to authenticated users only
 * Redirects to sign-in page if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-brand-500"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
