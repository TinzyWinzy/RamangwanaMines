import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export async function createDoc<T extends DocumentData>(collectionName: string, data: T) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function setDocById<T extends DocumentData>(collectionName: string, docId: string, data: T) {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDocById(collectionName: string, docId: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getDocById<T>(collectionName: string, docId: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as T;
}

export async function queryDocs<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);
}

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);
      callback(data);
    },
    onError
  );
}

export function subscribeToDoc<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, collectionName, docId),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as unknown as T);
      } else {
        callback(null);
      }
    },
    onError
  );
}

export async function deleteDocById(collectionName: string, docId: string) {
  await deleteDoc(doc(db, collectionName, docId));
}

export { where, orderBy, limit, serverTimestamp };
