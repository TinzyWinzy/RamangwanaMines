import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';

export function usePaynow() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (email: string, amount: number, reference: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions();
      const paynowInitiate = httpsCallable(functions, 'paynowInitiate');
      const result = await paynowInitiate({ email, amount, reference });
      setIsLoading(false);
      return result.data as { pollUrl: string; status: string };
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  const checkStatus = async (pollUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions();
      const paynowStatus = httpsCallable(functions, 'paynowStatus');
      const result = await paynowStatus({ pollUrl });
      setIsLoading(false);
      return result.data as { paid: boolean; status: string };
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return { initiatePayment, checkStatus, isLoading, error };
}
