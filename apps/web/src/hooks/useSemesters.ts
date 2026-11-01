import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firestore";
import { Semester } from "@/types/semester";
import { semesterFromDoc, sortSemesters } from "@/utils/semesterOrder";

/**
 * Live semester list for the user, in the switcher's order (`sortSemesters`, which also lists
 * the semesters that have no `order`).
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

    const unsubscribe = onSnapshot(
      semColRef,
      (snapshot) => {
        const sorted = sortSemesters(
          snapshot.docs.map((docSnap) => semesterFromDoc(docSnap.id, docSnap.data())),
        );
        setSemesters(sorted.map(({ id, name }) => ({ id, name })));
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to semesters:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const activeSemester = forceSemesterId
    ? (semesters.find((sem) => sem.id === forceSemesterId) ?? null)
    : (semesters[0] ?? null);

  return { semesters, setSemesters, isLoading, activeSemester };
}
