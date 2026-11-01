import { useState, useCallback } from "react";
import { writeBatch, getDocs, query, where, getDoc } from "firebase/firestore";
import { db } from "../lib/firestore";
import { useAuth } from "../contexts/AuthContext";
import { getAssessmentsRef, getCoursePreferencesDocRef } from "../lib/firebaseUtils";
import { isValidCourseColor } from "../constants/courseColors";
import { validateCourseName } from "../utils/courseName";

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
  options: UseCourseRenameOptions = {},
): UseCourseRenameReturn => {
  const { user } = useAuth();
  const { onSuccess, onError } = options;
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameCourse = useCallback(
    async (oldName: string, newName: string) => {
      if (!user || !semesterId) {
        const errorMsg = "User not authenticated or semester not selected";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      const validationError = validateCourseName(newName.trim());
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return;
      }

      const trimmedNewName = newName.trim();
      const trimmedOldName = oldName.trim();

      if (trimmedOldName === trimmedNewName) {
        const errorMsg = "New course name must be different from current name";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      setIsRenaming(true);
      setError(null);

      try {
        const batch = writeBatch(db);

        const assessmentsRef = getAssessmentsRef(user.uid, semesterId);
        const assessmentsQuery = query(assessmentsRef, where("courseName", "==", trimmedOldName));
        const assessmentsSnapshot = await getDocs(assessmentsQuery);

        assessmentsSnapshot.forEach((assessmentDoc) => {
          const assessmentRef = assessmentDoc.ref;
          batch.update(assessmentRef, {
            courseName: trimmedNewName,
          });
        });

        // The preferences doc's ID comes from the course name, so the doc moves to the new ID
        const oldPrefsRef = getCoursePreferencesDocRef(user.uid, semesterId, trimmedOldName);
        const newPrefsRef = getCoursePreferencesDocRef(user.uid, semesterId, trimmedNewName);

        try {
          const oldPrefsDoc = await getDoc(oldPrefsRef);
          if (oldPrefsDoc.exists()) {
            // Only the values the rules accept move: one bad stored value would fail the batch
            const { color, targetGrade } = oldPrefsDoc.data();
            batch.set(newPrefsRef, {
              ...(isValidCourseColor(color) ? { color: color.toUpperCase() } : {}),
              ...(typeof targetGrade === "number" ? { targetGrade } : {}),
            });
            batch.delete(oldPrefsRef);
          }
        } catch (prefsError) {
          console.warn("Error handling course preferences during rename:", prefsError);
          // Don't fail the entire operation if preferences update fails
        }

        await batch.commit();

        onSuccess?.(trimmedOldName, trimmedNewName);
      } catch (err) {
        console.error("Error renaming course:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to rename course";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsRenaming(false);
      }
    },
    [user, semesterId, onSuccess, onError],
  );

  return {
    renameCourse,
    isRenaming,
    error,
  };
};
