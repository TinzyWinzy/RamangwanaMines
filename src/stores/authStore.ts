import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AppUser, UserRole } from '../types';

interface AuthState {
  firebaseUser: User | null;
  userProfile: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, data: { name: string; phone: string; companyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profile = userDoc.data() as AppUser | undefined;
        set({
          firebaseUser: user,
          userProfile: profile || null,
          isAuthenticated: !!profile,
          isLoading: false,
        });
      } else {
        set({
          firebaseUser: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
    return unsubscribe;
  },

  login: async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = userDoc.data() as AppUser | undefined;
    set({ firebaseUser: user, userProfile: profile || null, isAuthenticated: !!profile });
  },

  register: async (email, password, data) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile: AppUser = {
      uid: user.uid,
      name: data.name,
      phone: data.phone,
      email,
      companyName: data.companyName || '',
      role: 'client' as UserRole,
      isActive: true,
      addresses: [],
      certifications: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    set({ firebaseUser: user, userProfile: profile, isAuthenticated: true });
  },

  logout: async () => {
    await signOut(auth);
    set({ firebaseUser: null, userProfile: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const { firebaseUser } = get();
    if (!firebaseUser) return;
    await setDoc(doc(db, 'users', firebaseUser.uid), data, { merge: true });
    const current = get().userProfile;
    if (current) {
      set({ userProfile: { ...current, ...data } });
    }
  },
}));
