import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../ui/Spinner';
import type { UserRole } from '../../types';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
  minimumRole?: UserRole;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, roles, minimumRole, fallback }: RequireAuthProps) {
  const { isAuthenticated, isLoading, role, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/client-portal" state={{ from: location }} replace />;
  }

  if (roles && role && !roles.includes(role)) {
    return fallback ? <>{fallback}</> : <AccessDenied />;
  }

  if (minimumRole && role && !hasRole(minimumRole)) {
    return fallback ? <>{fallback}</> : <AccessDenied />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RequireAuth minimumRole="admin" fallback={fallback}>
      {children}
    </RequireAuth>
  );
}

export function RequireStaff({ children }: { children: React.ReactNode }) {
  return <RequireAuth minimumRole="sales_rep">{children}</RequireAuth>;
}

function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
        <a href="/" className="text-primary-500 hover:underline text-sm">Return to Home</a>
      </div>
    </div>
  );
}
