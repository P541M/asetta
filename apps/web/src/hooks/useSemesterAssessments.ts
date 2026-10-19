import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firestore";
import { Assessment } from "../types/assessment";
import {
  assessmentFromDoc,
  computeStats,
  courseNames,
  processCourseStats,
} from "../utils/semesterAssessments";
import { useNow } from "./useNow";

interface SemesterSnapshot {
  uid: string;
  semesterId: string;
  assessments: Assessment[];
  error: string | null;
}

const NO_ASSESSMENTS: Assessment[] = [];

/**
 * Live assessments for the selected semester (Firestore onSnapshot), plus the
 * derived course list and dashboard stats. Every dashboard tab reads this one
 * listener (A11).
 *
 * The subscription is keyed on user + semester only. Each snapshot is stored with
 * the user and semester it belongs to, so after a switch no tab shows (or edits) the last
 * semester's assessments: it loads until the new semester's first snapshot.
 */
export function useSemesterAssessments(user: User | null, selectedSemesterId: string) {
  const [loaded, setLoaded] = useState<SemesterSnapshot | null>(null);
  const now = useNow();

  const current =
    user && loaded?.uid === user.uid && loaded.semesterId === selectedSemesterId ? loaded : null;
  const assessments = current?.assessments ?? NO_ASSESSMENTS;
  const error = current?.error ?? null;
  const isLoading = Boolean(user && selectedSemesterId) && current === null;

  const availableCourses = useMemo(() => courseNames(assessments), [assessments]);
  // Derived at render, not in the snapshot callback, so they follow the clock
  const courses = useMemo(() => processCourseStats(assessments, now), [assessments, now]);
  const stats = useMemo(() => computeStats(assessments, now), [assessments, now]);

  useEffect(() => {
    if (!user || !selectedSemesterId) return;

    const assessmentsRef = collection(
      db,
      "users",
      user.uid,
      "semesters",
      selectedSemesterId,
      "assessments",
    );
    const q = query(assessmentsRef, orderBy("dueDate", "asc"));

    return onSnapshot(
      q,
      (snapshot) => {
        setLoaded({
          uid: user.uid,
          semesterId: selectedSemesterId,
          assessments: snapshot.docs.map((doc) => assessmentFromDoc(doc.id, doc.data())),
          error: null,
        });
      },
      (err) => {
        console.error("Error fetching assessments:", err);
        setLoaded({
          uid: user.uid,
          semesterId: selectedSemesterId,
          assessments: NO_ASSESSMENTS,
          error: "Failed to load assessments. Please try again.",
        });
      },
    );
  }, [selectedSemesterId, user]);

  return { assessments, courses, availableCourses, isLoading, error, stats };
}
