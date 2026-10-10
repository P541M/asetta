import { useCallback, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getCoursePreferencesDocRef } from "../lib/firebaseUtils";
import { isValidCourseColor } from "../constants/courseColors";

/**
 * Stored course colors for a semester (courseName -> "#RRGGBB"), live via
 * onSnapshot. Only explicit user choices are stored; unset courses resolve to
 * their name-hash default at render time (constants/courseColors.ts), so a
 * failed read still paints every course. Local writes emit a cache snapshot
 * immediately, so the UI updates optimistically without extra state.
 */
export function useCourseColors(user: User | null, semesterId: string) {
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !semesterId) {
      setCourseColors({});
      return;
    }

    const prefsRef = collection(
      db,
      "users",
      user.uid,
      "semesters",
      semesterId,
      "coursePreferences",
    );
    const unsubscribe = onSnapshot(
      prefsRef,
      (snapshot) => {
        const colors: Record<string, string> = {};
        snapshot.forEach((docSnap) => {
          const color = docSnap.data().color;
          // Malformed values are dropped: resolveCourseColor falls back to the default
          if (isValidCourseColor(color)) {
            colors[docSnap.id] = color.toUpperCase();
          }
        });
        setCourseColors(colors);
      },
      (err) => {
        console.error("Error loading course colors:", err);
        setCourseColors({});
      },
    );
    return unsubscribe;
  }, [user, semesterId]);

  const setCourseColor = useCallback(
    async (courseName: string, color: string) => {
      if (!user || !semesterId) {
        throw new Error("User not authenticated or semester not selected");
      }
      if (!isValidCourseColor(color)) {
        throw new Error("Course color must be a #RRGGBB hex value");
      }
      await setDoc(
        getCoursePreferencesDocRef(user.uid, semesterId, courseName),
        { color: color.toUpperCase() },
        { merge: true },
      );
    },
    [user, semesterId],
  );

  return { courseColors, setCourseColor };
}
