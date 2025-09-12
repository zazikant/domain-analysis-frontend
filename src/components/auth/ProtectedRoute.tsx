/**
 * Protected Route Component
 * Wraps components that require authentication and access approval
 */

import React from 'react';
import { useAuth, AuthComponent } from './GoogleAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}): React.ReactElement => {
  const { isAuthenticated, hasAccess, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth component if not authenticated or no access
  if (!isAuthenticated || !hasAccess) {
    return <>{fallback || <AuthComponent />}</>;
  }

  // User is authenticated and has access
  return <>{children}</>;
};

// Higher Order Component version
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;