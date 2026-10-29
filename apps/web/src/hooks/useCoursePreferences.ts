import { useState, useEffect, useCallback } from "react";
import { getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { getCoursePreferencesDocRef } from "../lib/firebaseUtils";
import {
  CoursePreferences,
  CoursePreferencesHook,
  DEFAULT_COURSE_PREFERENCES,
} from "../types/coursePreferences";

export const useCoursePreferences = (
  semesterId: string | null,
  courseName: string | null,
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

        // Merge over defaults: a doc created color-first has no targetGrade yet. A course without
        // a doc just shows the defaults; viewing it writes nothing (A12).
        setPreferences({
          ...DEFAULT_COURSE_PREFERENCES,
          ...(preferencesDoc.exists() ? (preferencesDoc.data() as Partial<CoursePreferences>) : {}),
        });
      } catch (err) {
        console.error("Error loading course preferences:", err);
        setError("Failed to load course preferences");
        // Fallback to default preferences
        setPreferences({ ...DEFAULT_COURSE_PREFERENCES });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, semesterId, courseName]);

  const updateTargetGrade = useCallback(
    async (targetGrade: number) => {
      if (!user || !semesterId || !courseName) {
        throw new Error("Missing required parameters for updating target grade");
      }

      // Shown before the write resolves (it waits for the server), so the field that saved it
      // doesn't flash the old target; a failed write shows the error in place of the calculator
      setPreferences((prev) =>
        prev ? { ...prev, targetGrade } : { ...DEFAULT_COURSE_PREFERENCES, targetGrade },
      );

      try {
        // One merged write creates or updates the doc (merge: never clobber a concurrent color write)
        await setDoc(
          getCoursePreferencesDocRef(user.uid, semesterId, courseName),
          { targetGrade },
          { merge: true },
        );
      } catch (err) {
        console.error("Error updating target grade:", err);
        setError("Failed to save target grade");
        throw err;
      }
    },
    [user, semesterId, courseName],
  );

  return {
    preferences,
    loading,
    error,
    updateTargetGrade,
  };
};
