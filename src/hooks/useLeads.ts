import { useEffect } from 'react';
import { useLeadStore } from '../stores/leadStore';

export function useLeads(role: string = 'admin', userId?: string) {
  const store = useLeadStore();

  useEffect(() => {
    const unsubscribe = store.subscribeEnquiries(role, userId);
    return () => unsubscribe();
  }, [role, userId]);

  return {
    enquiries: store.enquiries,
    isLoading: store.isLoading,
    error: store.error,
    createEnquiry: store.createEnquiry,
    updateEnquiry: store.updateEnquiry,
  };
}
