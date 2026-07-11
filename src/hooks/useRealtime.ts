import { useEffect, useState } from 'react';
import { onSnapshot, doc, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useRealtime<T>(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (snap) => {
        if (snap.exists()) {
          setData({ id: snap.id, ...snap.data() } as unknown as T);
        } else {
          setData(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, isLoading, error };
}
