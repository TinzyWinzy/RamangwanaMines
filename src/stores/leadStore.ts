import { create } from 'zustand';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Enquiry } from '../types';

interface LeadState {
  enquiries: Enquiry[];
  isLoading: boolean;
  error: string | null;
  subscribeEnquiries: (role: string, userId?: string) => () => void;
  createEnquiry: (data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'leadScore' | 'status' | 'documents'>) => Promise<string>;
  updateEnquiry: (id: string, data: Partial<Enquiry>) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set) => ({
  enquiries: [],
  isLoading: false,
  error: null,

  subscribeEnquiries: (role, userId) => {
    set({ isLoading: true });
    let q;
    if (role === 'admin' || role === 'sales_rep') {
      q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
    }
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const enquiries = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Enquiry[];
        set({ enquiries, isLoading: false, error: null });
      },
      (error) => {
        set({ error: error.message, isLoading: false });
      }
    );
    return unsubscribe;
  },

  createEnquiry: async (data) => {
    const docRef = await addDoc(collection(db, 'enquiries'), {
      ...data,
      status: 'new',
      leadScore: 0,
      documents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateEnquiry: async (id, data) => {
    await updateDoc(doc(db, 'enquiries', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
}));
