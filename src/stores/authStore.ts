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

const VALID_ROLES: UserRole[] = ['client', 'project_manager', 'sales_rep', 'trainer', 'trainee', 'admin', 'super_admin'];

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

async function resolveRole(user: User): Promise<UserRole> {
  // 1. Check Firestore doc first (authoritative source for client)
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const docRole = userDoc.data()?.role as UserRole | undefined;
  if (docRole && VALID_ROLES.includes(docRole)) return docRole;

  // 2. Fall back to Firebase Auth custom claims
  try {
    const idTokenResult = await user.getIdTokenResult();
    const claimRole = idTokenResult.claims['role'] as UserRole | undefined;
    if (claimRole && VALID_ROLES.includes(claimRole)) return claimRole;
  } catch {
    // token refresh may fail silently
  }

  return 'client';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await resolveRole(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profileData = userDoc.data() as Omit<AppUser, 'uid'> | undefined;
        const profile: AppUser | null = profileData
          ? { uid: user.uid, ...profileData, role: profileData.role || role }
          : {
              uid: user.uid,
              name: user.displayName || '',
              phone: user.phoneNumber || '',
              email: user.email || '',
              role,
              isActive: true,
              addresses: [],
              certifications: [],
              createdAt: new Date(),
            };
        set({
          firebaseUser: user,
          userProfile: profile,
          isAuthenticated: true,
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
    const role = await resolveRole(user);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const profileData = userDoc.data() as Omit<AppUser, 'uid'> | undefined;
    const profile: AppUser | null = profileData
      ? { uid: user.uid, ...profileData, role: profileData.role || role }
      : null;
    set({ firebaseUser: user, userProfile: profile, isAuthenticated: !!profile });
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
