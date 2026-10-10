import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, getDocs, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Semester } from "@/types/semester";

/**
 * Live semester list for the user (ordered by `order`), plus the one-time
 * migration that backfills the `order` field on older documents.
 *
 * The active semester derives synchronously: the URL's semester id when given,
 * else the first semester. No selection state exists outside the URL.
 */
export function useSemesters(user: User | null, forceSemesterId?: string) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSemesters([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const semColRef = collection(db, "users", user.uid, "semesters");
    const q = query(semColRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSemesters(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, name: docSnap.data().name })),
        );
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to semesters:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const migrateSemesters = async () => {
      if (!user) return;

      try {
        const semColRef = collection(db, "users", user.uid, "semesters");
        const snapshot = await getDocs(semColRef);
        const needsMigration = snapshot.docs.some((doc) => !doc.data().hasOwnProperty("order"));

        if (needsMigration) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc, index) => {
            if (!doc.data().hasOwnProperty("order")) {
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

  const activeSemester = forceSemesterId
    ? (semesters.find((sem) => sem.id === forceSemesterId) ?? null)
    : (semesters[0] ?? null);

  return { semesters, setSemesters, isLoading, activeSemester };
}
