import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, getDocs, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Semester } from "@/types/semester";

/**
 * Live semester list for the user (ordered by `order`), plus the one-time
 * migration that backfills the `order` field on older documents.
 *
 * Auto-selects the first semester via `onSelect` when nothing is selected yet.
 */
export function useSemesters(
  user: User | null,
  selectedSemester: string,
  onSelect: (semesterName: string) => void,
) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  // Listen for changes to the user's semesters in Firestore
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setIsDataReady(false);
    const semColRef = collection(db, "users", user.uid, "semesters");
    const q = query(semColRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const sems: Semester[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data().name,
        }));
        setSemesters(sems);
        setIsLoading(false);

        // Add a small delay before marking data as ready to ensure smooth animations
        setTimeout(() => {
          setIsDataReady(true);
        }, 50);

        if (sems.length > 0 && !selectedSemester) {
          onSelect(sems[0].name);
        }
      },
      (error) => {
        console.error("Error listening to semesters:", error);
        setIsLoading(false);
        setIsDataReady(true);
      },
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onSelect]); // selectedSemester excluded intentionally to prevent double stutter on semester switching

  // Migration effect to ensure all semesters have an order field
  useEffect(() => {
    const migrateSemesters = async () => {
      if (!user) return;

      try {
        const semColRef = collection(db, "users", user.uid, "semesters");
        const snapshot = await getDocs(semColRef);

        // Check if any semesters are missing the order field
        const needsMigration = snapshot.docs.some((doc) => !doc.data().hasOwnProperty("order"));

        if (needsMigration) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            if (!data.hasOwnProperty("order")) {
              batch.update(doc.ref, { order: index });
            }
          });
          await batch.commit();
        }
      } catch (error) {
        console.error("Error during migration:", error);
      }
    };

    migrateSemesters();
  }, [user]);

  return { semesters, setSemesters, isLoading, isDataReady };
}
