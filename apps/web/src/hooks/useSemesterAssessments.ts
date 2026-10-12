import { useEffect, useMemo, useRef, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Assessment } from "../types/assessment";
import {
  assessmentFromDoc,
  computeStats,
  courseNames,
  processCourseStats,
} from "../utils/semesterAssessments";
import { useNow } from "./useNow";

/**
 * Live assessments for the selected semester (Firestore onSnapshot), plus the
 * derived course list and dashboard stats.
 *
 * The subscription is keyed on user + semester only. Whether the loading spinner
 * shows is tracked via a ref so that data arriving/changing does not tear down
 * and recreate the listener (previously this effect also depended on
 * `assessments.length`, causing a needless re-subscribe on every add/delete).
 */
export function useSemesterAssessments(user: User | null, selectedSemesterId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);
  const now = useNow();

  // Derived at render, not in the snapshot callback, so they follow the clock
  const courses = useMemo(() => processCourseStats(assessments, now), [assessments, now]);
  const stats = useMemo(() => computeStats(assessments, now), [assessments, now]);

  useEffect(() => {
    if (!user || !selectedSemesterId) {
      setAssessments([]);
      hasDataRef.current = false;
      return;
    }

    // Only show loading spinner on initial load or when there's no previous data
    if (!hasDataRef.current) {
      setIsLoading(true);
    }
    setError(null);
    const assessmentsRef = collection(
      db,
      "users",
      user.uid,
      "semesters",
      selectedSemesterId,
      "assessments",
    );
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const assessmentsList = snapshot.docs.map((doc) => assessmentFromDoc(doc.id, doc.data()));
          hasDataRef.current = assessmentsList.length > 0;
          setAssessments(assessmentsList);

          setAvailableCourses(courseNames(assessmentsList));
          setIsLoading(false);
        },
        (err) => {
          console.error("Error fetching assessments:", err);
          setError("Failed to load assessments. Please try again.");
          setIsLoading(false);
        },
      );
    } catch (error) {
      console.error("Error setting up assessments listener:", error);
      setError("Failed to set up assessments listener. Please try again.");
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedSemesterId, user]);

  return { assessments, courses, availableCourses, isLoading, error, stats };
}
