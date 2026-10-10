import { useCallback, useRef, useState } from "react";
import { User } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import { getAssessmentDocRef } from "../lib/firebaseUtils";
import { AssessmentStatus } from "../types/assessment";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface AssessmentSaveFields {
  mark: number | null;
  weight: number;
  status: AssessmentStatus;
}

/**
 * Debounced per-assessment saves for the grade calculator.
 *
 * Saves are queued from user edits only — data arriving from a fetch is not an
 * edit and must never trigger a write. Each queued save captures its document
 * ref at edit time, so switching semesters mid-debounce cannot retarget a
 * pending write to a path where the assessment does not exist.
 */
export function useAssessmentAutoSave(user: User | null, semesterId: string, delay = 750) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const pendingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueSave = useCallback(
    (assessmentId: string, fields: AssessmentSaveFields) => {
      if (!user || !semesterId) return;

      const key = `${semesterId}/${assessmentId}`;
      const existing = pendingTimers.current.get(key);
      if (existing) clearTimeout(existing);
      if (idleTimer.current) clearTimeout(idleTimer.current);

      const assessmentRef = getAssessmentDocRef(user.uid, semesterId, assessmentId);
      const timer = setTimeout(async () => {
        pendingTimers.current.delete(key);
        try {
          setStatus("saving");
          setError(null);
          await updateDoc(assessmentRef, { ...fields });
          if (pendingTimers.current.size === 0) {
            setStatus("saved");
            idleTimer.current = setTimeout(() => setStatus("idle"), 2000);
          }
        } catch (err) {
          console.error("Auto-save error:", err);
          setError(err instanceof Error ? err.message : "Failed to save changes");
          setStatus("error");
        }
      }, delay);

      pendingTimers.current.set(key, timer);
    },
    [user, semesterId, delay],
  );

  return { queueSave, status, error };
}
