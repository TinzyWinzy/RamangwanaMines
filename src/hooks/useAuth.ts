import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    const unsubscribe = store.init();
    return () => unsubscribe();
  }, []);

  return {
    user: store.firebaseUser,
    profile: store.userProfile,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
  };
}
