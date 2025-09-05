import { useState, useEffect, useCallback } from 'react';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getCoursePreferencesDocRef } from '../lib/firebaseUtils';
import { 
  CoursePreferences, 
  CoursePreferencesHook, 
  DEFAULT_COURSE_PREFERENCES 
} from '../types/coursePreferences';

export const useCoursePreferences = (
  semesterId: string | null,
  courseName: string | null
): CoursePreferencesHook => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<CoursePreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences when semesterId or courseName changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !semesterId || !courseName) {
        setPreferences(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const preferencesRef = getCoursePreferencesDocRef(user.uid, semesterId, courseName);
        const preferencesDoc = await getDoc(preferencesRef);

        if (preferencesDoc.exists()) {
          const data = preferencesDoc.data() as CoursePreferences;
          setPreferences(data);
        } else {
          // Create default preferences for new course
          const defaultPrefs = { ...DEFAULT_COURSE_PREFERENCES };
          await setDoc(preferencesRef, defaultPrefs);
          setPreferences(defaultPrefs);
        }
      } catch (err) {
        console.error('Error loading course preferences:', err);
        setError('Failed to load course preferences');
        // Fallback to default preferences
        setPreferences({ ...DEFAULT_COURSE_PREFERENCES });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, semesterId, courseName]);

  const updateTargetGrade = useCallback(async (targetGrade: number) => {
    if (!user || !semesterId || !courseName) {
      throw new Error('Missing required parameters for updating target grade');
    }

    try {
      const preferencesRef = getCoursePreferencesDocRef(user.uid, semesterId, courseName);
      
      // Check if document exists
      const preferencesDoc = await getDoc(preferencesRef);
      
      if (preferencesDoc.exists()) {
        // Update existing document
        await updateDoc(preferencesRef, { targetGrade });
      } else {
        // Create new document with target grade
        await setDoc(preferencesRef, {
          ...DEFAULT_COURSE_PREFERENCES,
          targetGrade,
        });
      }

      // Update local state
      setPreferences(prev => prev ? { ...prev, targetGrade } : { ...DEFAULT_COURSE_PREFERENCES, targetGrade });
    } catch (err) {
      console.error('Error updating target grade:', err);
      setError('Failed to save target grade');
      throw err;
    }
  }, [user, semesterId, courseName]);

  const resetPreferences = useCallback(async () => {
    if (!user || !semesterId || !courseName) {
      throw new Error('Missing required parameters for resetting preferences');
    }

    try {
      const preferencesRef = getCoursePreferencesDocRef(user.uid, semesterId, courseName);
      const defaultPrefs = { ...DEFAULT_COURSE_PREFERENCES };
      
      await setDoc(preferencesRef, defaultPrefs);
      setPreferences(defaultPrefs);
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError('Failed to reset preferences');
      throw err;
    }
  }, [user, semesterId, courseName]);

  return {
    preferences,
    loading,
    error,
    updateTargetGrade,
    resetPreferences,
  };
};