import { useState, useEffect } from 'react';
import { getDocs, query, where, Query } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getAssessmentsRef } from '../lib/firebaseUtils';
import { Assessment } from '../types/assessment';

interface UseAssessmentsOptions {
  courseName?: string;
  autoFetch?: boolean;
}

interface UseAssessmentsReturn {
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch assessments with optional course filtering
 * Eliminates duplicate Firebase query logic across components
 */
export const useAssessments = (
  semesterId: string,
  options: UseAssessmentsOptions = {}
): UseAssessmentsReturn => {
  const { user } = useAuth();
  const { courseName, autoFetch = true } = options;
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    if (!user || !semesterId) {
      setAssessments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const assessmentsRef = getAssessmentsRef(user.uid, semesterId);
      
      let assessmentsQuery: Query = assessmentsRef;
      
      // Add course filter if specified
      if (courseName) {
        assessmentsQuery = query(assessmentsRef, where('courseName', '==', courseName));
      }

      const querySnapshot = await getDocs(assessmentsQuery);
      const assessmentsList: Assessment[] = [];

      querySnapshot.forEach((doc) => {
        assessmentsList.push({
          id: doc.id,
          ...(doc.data() as Omit<Assessment, 'id'>),
        });
      });

      setAssessments(assessmentsList);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError(`Failed to load assessments${courseName ? ' for this course' : ''}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAssessments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, semesterId, courseName, autoFetch]);

  return {
    assessments,
    loading,
    error,
    refetch: fetchAssessments,
  };
};