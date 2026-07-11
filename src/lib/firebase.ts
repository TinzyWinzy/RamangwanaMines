import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyA2RsQirTSb9Xxp6l6oBMQogirVof9h-Ts',
  authDomain: 'studio-6147230335-10fd1.firebaseapp.com',
  projectId: 'studio-6147230335-10fd1',
  storageBucket: 'studio-6147230335-10fd1.firebasestorage.app',
  messagingSenderId: '471897401571',
  appId: '1:471897401571:web:a96e0d06357ac8fa9dfdd6',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
