import { useState, useEffect, useRef } from 'react';
import { subscribeToCollection, subscribeToDoc, queryDocs, getDocById } from '../lib/db';
import type { QueryConstraint } from 'firebase/firestore';

export function useFirestoreCollection<T>(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const constraintsKey = useRef(JSON.stringify(constraints));

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToCollection<T>(
      collectionName,
      constraints,
      (result) => {
        setData(result);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName, constraintsKey.current]);

  return { data, isLoading, error };
}

export function useFirestoreDoc<T>(collectionName: string, docId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setIsLoading(false);
      setData(null);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToDoc<T>(
      collectionName,
      docId,
      (result) => {
        setData(result);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, isLoading, error };
}

export function useFirestoreQuery<T>(collectionName: string, constraints: QueryConstraint[] = [], enabled: boolean = true) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = async () => {
    if (!enabled) return;
    setIsLoading(true);
    try {
      const result = await queryDocs<T>(collectionName, constraints);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [collectionName, JSON.stringify(constraints), enabled]);

  return { data, isLoading, refetch: fetch };
}
