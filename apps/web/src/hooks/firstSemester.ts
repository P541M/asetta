import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firestore";
import { semesterFromDoc, sortSemesters } from "../utils/semesterOrder";

/**
 * The ID of the semester the switcher lists first, or null with none. `/dashboard` loads this with
 * `import()` once the user doc is in, so the page itself doesn't ship Firestore.
 */
export async function firstSemesterId(userId: string): Promise<string | null> {
  const snapshot = await getDocs(collection(db, "users", userId, "semesters"));
  const [first] = sortSemesters(
    snapshot.docs.map((docSnap) => semesterFromDoc(docSnap.id, docSnap.data())),
  );
  return first?.id ?? null;
}
