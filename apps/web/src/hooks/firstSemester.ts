import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firestore";

/**
 * The ID of the user's first semester, or null with none. `/dashboard` loads this with `import()`
 * once the user doc is in, so the page itself doesn't ship Firestore (A15).
 */
export async function firstSemesterId(userId: string): Promise<string | null> {
  const semestersRef = collection(db, "users", userId, "semesters");
  const snapshot = await getDocs(query(semestersRef, orderBy("order", "asc"), limit(1)));
  return snapshot.empty ? null : snapshot.docs[0].id;
}
