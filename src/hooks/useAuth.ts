import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { isAdminRole, hasMinRole, type UserRole } from '../types';
import { getPermissions } from '../lib/permissions';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    const unsubscribe = store.init();
    return () => unsubscribe();
  }, []);

  const role = store.userProfile?.role ?? null;
  const permissions = getPermissions(role);

  return {
    user: store.firebaseUser,
    profile: store.userProfile,
    role,
    permissions,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isAdmin: isAdminRole(role),
    hasRole: (minimumRole: UserRole) => hasMinRole(role, minimumRole),
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
  };
}
