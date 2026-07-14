import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Resolves the active semester name + document id.
 *
 * Two modes, matching the dashboard routes:
 * - `forceSemesterId` set (deep link `/dashboard/[semester]/…`): load that document directly.
 * - Otherwise: the user picks a semester by name (SemesterTabs) and we look up its id.
 */
export function useSemesterSelection(user: User | null, forceSemesterId?: string) {
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  useEffect(() => {
    const findSemesterId = async () => {
      if (!user) {
        setSelectedSemesterId("");
        setSelectedSemester("");
        return;
      }

      // If forceSemesterId is provided, use it directly
      if (forceSemesterId) {
        try {
          const semesterRef = doc(db, "users", user.uid, "semesters", forceSemesterId);
          const semesterSnap = await getDoc(semesterRef);
          if (semesterSnap.exists()) {
            setSelectedSemesterId(forceSemesterId);
            setSelectedSemester(semesterSnap.data().name);
          } else {
            setSelectedSemesterId("");
            setSelectedSemester("");
          }
        } catch (err) {
          console.error("Error finding forced semester:", err);
          setSelectedSemesterId("");
          setSelectedSemester("");
        }
        return;
      }

      // Original logic for when no forceSemesterId is provided
      if (!selectedSemester) {
        setSelectedSemesterId("");
        return;
      }
      try {
        const semestersRef = collection(db, "users", user.uid, "semesters");
        const q = query(semestersRef, where("name", "==", selectedSemester));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setSelectedSemesterId(querySnapshot.docs[0].id);
        } else {
          setSelectedSemesterId("");
        }
      } catch (err) {
        console.error("Error finding semester ID:", err);
        setSelectedSemesterId("");
      }
    };
    findSemesterId();
  }, [selectedSemester, user, forceSemesterId]);

  return { selectedSemester, setSelectedSemester, selectedSemesterId };
}
