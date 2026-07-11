import { create } from 'zustand';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { TrainingCourse, TrainingBatch, TrainingEnrollment, TrainingAssessment } from '../types';

interface TrainingState {
  courses: TrainingCourse[];
  batches: TrainingBatch[];
  enrollments: TrainingEnrollment[];
  currentAssessment: TrainingAssessment | null;
  isLoading: boolean;
  error: string | null;
  subscribeCourses: () => () => void;
  subscribeBatches: (courseId: string) => () => void;
  subscribeEnrollments: (userId: string) => () => void;
  fetchAssessment: (courseId: string, moduleNumber: number) => Promise<void>;
  enrollInCourse: (data: { userId: string; courseId: string; batchId: string; enquiryId?: string }) => Promise<string>;
  updateEnrollmentProgress: (enrollmentId: string, completedModules: number[], progress: number) => Promise<void>;
  submitAssessment: (enrollmentId: string, moduleNumber: number, score: number, maxScore: number, passed: boolean) => Promise<void>;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  courses: [],
  batches: [],
  enrollments: [],
  currentAssessment: null,
  isLoading: false,
  error: null,

  subscribeCourses: () => {
    set({ isLoading: true });
    const q = query(
      collection(db, 'trainingCourses'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const courses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TrainingCourse[];
        set({ courses, isLoading: false, error: null });
      },
      (error) => set({ error: error.message, isLoading: false })
    );
    return unsubscribe;
  },

  subscribeBatches: (courseId) => {
    set({ isLoading: true });
    const q = query(
      collection(db, 'trainingBatches'),
      where('courseId', '==', courseId),
      orderBy('startDate', 'asc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const batches = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TrainingBatch[];
        set({ batches, isLoading: false, error: null });
      },
      (error) => set({ error: error.message, isLoading: false })
    );
    return unsubscribe;
  },

  subscribeEnrollments: (userId) => {
    set({ isLoading: true });
    const q = query(
      collection(db, 'trainingEnrollments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const enrollments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TrainingEnrollment[];
        set({ enrollments, isLoading: false, error: null });
      },
      (error) => set({ error: error.message, isLoading: false })
    );
    return unsubscribe;
  },

  fetchAssessment: async (courseId, moduleNumber) => {
    const q = query(
      collection(db, 'trainingAssessments'),
      where('courseId', '==', courseId),
      where('moduleNumber', '==', moduleNumber)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        set({ currentAssessment: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TrainingAssessment });
      } else {
        set({ currentAssessment: null });
      }
    });
    return unsubscribe as unknown as void;
  },

  enrollInCourse: async (data) => {
    const docRef = await addDoc(collection(db, 'trainingEnrollments'), {
      ...data,
      status: 'enrolled',
      progress: 0,
      completedModules: [],
      assessmentScores: [],
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateEnrollmentProgress: async (enrollmentId, completedModules, progress) => {
    const status = progress >= 100 ? 'completed' : 'in_progress';
    await updateDoc(doc(db, 'trainingEnrollments', enrollmentId), {
      completedModules,
      progress,
      status,
      updatedAt: serverTimestamp(),
    });
  },

  submitAssessment: async (enrollmentId, moduleNumber, score, maxScore, passed) => {
    const enrollmentRef = doc(db, 'trainingEnrollments', enrollmentId);
    const enrollmentSnap = await getDoc(enrollmentRef);
    if (!enrollmentSnap.exists()) return;

    const enrollment = enrollmentSnap.data() as TrainingEnrollment;
    const scores = [...(enrollment.assessmentScores || [])];
    const existingIdx = scores.findIndex((s) => s.moduleNumber === moduleNumber);
    const newScore = {
      moduleNumber,
      score,
      maxScore,
      passed,
      attemptedAt: new Date(),
    };
    if (existingIdx >= 0) {
      scores[existingIdx] = newScore;
    } else {
      scores.push(newScore);
    }

    await updateDoc(enrollmentRef, {
      assessmentScores: scores,
      updatedAt: serverTimestamp(),
    });
  },
}));
