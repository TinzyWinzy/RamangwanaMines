import { useEffect } from 'react';
import { useTrainingStore } from '../stores/trainingStore';

export function useTraining(userId?: string) {
  const store = useTrainingStore();

  useEffect(() => {
    const unsubscribe = store.subscribeCourses();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const unsubscribe = store.subscribeEnrollments(userId);
      return () => unsubscribe();
    }
  }, [userId]);

  return {
    courses: store.courses,
    batches: store.batches,
    enrollments: store.enrollments,
    currentAssessment: store.currentAssessment,
    isLoading: store.isLoading,
    error: store.error,
    subscribeBatches: store.subscribeBatches,
    fetchAssessment: store.fetchAssessment,
    enrollInCourse: store.enrollInCourse,
    updateEnrollmentProgress: store.updateEnrollmentProgress,
    submitAssessment: store.submitAssessment,
  };
}
