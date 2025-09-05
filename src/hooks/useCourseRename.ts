import { useState, useCallback } from 'react';
import { writeBatch, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getAssessmentsRef, getCoursePreferencesDocRef } from '../lib/firebaseUtils';
import { CoursePreferences } from '../types/coursePreferences';

interface UseCourseRenameOptions {
  onSuccess?: (oldName: string, newName: string) => void;
  onError?: (error: string) => void;
}

interface UseCourseRenameReturn {
  renameCourse: (oldName: string, newName: string) => Promise<void>;
  isRenaming: boolean;
  error: string | null;
}

export const useCourseRename = (
  semesterId: string,
  options: UseCourseRenameOptions = {}
): UseCourseRenameReturn => {
  const { user } = useAuth();
  const { onSuccess, onError } = options;
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCourseName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return 'Course name cannot be empty';
    }
    if (name.trim().length > 100) {
      return 'Course name must be 100 characters or less';
    }
    // Prevent problematic characters that could cause issues with Firebase document IDs
    const invalidChars = /[\/\\#?[\]]/;
    if (invalidChars.test(name)) {
      return 'Course name cannot contain: / \\ # ? [ ]';
    }
    return null;
  };

  const renameCourse = useCallback(async (oldName: string, newName: string) => {
    if (!user || !semesterId) {
      const errorMsg = 'User not authenticated or semester not selected';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate new course name
    const validationError = validateCourseName(newName.trim());
    if (validationError) {
      setError(validationError);
      onError?.(validationError);
      return;
    }

    const trimmedNewName = newName.trim();
    const trimmedOldName = oldName.trim();

    // Check if names are the same
    if (trimmedOldName === trimmedNewName) {
      const errorMsg = 'New course name must be different from current name';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      // Create a batch for atomic updates
      const batch = writeBatch(db);

      // 1. Update all assessments with the old course name
      const assessmentsRef = getAssessmentsRef(user.uid, semesterId);
      const assessmentsQuery = query(assessmentsRef, where('courseName', '==', trimmedOldName));
      const assessmentsSnapshot = await getDocs(assessmentsQuery);

      let assessmentUpdateCount = 0;
      assessmentsSnapshot.forEach((assessmentDoc) => {
        const assessmentRef = assessmentDoc.ref;
        batch.update(assessmentRef, {
          courseName: trimmedNewName,
        });
        assessmentUpdateCount++;
      });

      // 2. Handle course preferences (copy to new document ID, delete old)
      const oldPrefsRef = getCoursePreferencesDocRef(user.uid, semesterId, trimmedOldName);
      const newPrefsRef = getCoursePreferencesDocRef(user.uid, semesterId, trimmedNewName);

      try {
        const oldPrefsDoc = await getDoc(oldPrefsRef);
        if (oldPrefsDoc.exists()) {
          const prefsData = oldPrefsDoc.data() as CoursePreferences;
          // Create new preferences document
          batch.set(newPrefsRef, prefsData);
          // Delete old preferences document
          batch.delete(oldPrefsRef);
        }
      } catch (prefsError) {
        console.warn('Error handling course preferences during rename:', prefsError);
        // Don't fail the entire operation if preferences update fails
      }

      // 3. Commit the batch
      await batch.commit();

      console.log(`Successfully renamed course "${trimmedOldName}" to "${trimmedNewName}"`, {
        assessmentsUpdated: assessmentUpdateCount,
      });

      onSuccess?.(trimmedOldName, trimmedNewName);
    } catch (err) {
      console.error('Error renaming course:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to rename course';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsRenaming(false);
    }
  }, [user, semesterId, onSuccess, onError]);

  return {
    renameCourse,
    isRenaming,
    error,
  };
};