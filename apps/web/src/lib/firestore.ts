import { doc, getFirestore, DocumentReference } from "firebase/firestore";
import { app } from "./firebase";

// Kept apart from lib/firebase.ts so Firestore loads only with the pages and chunks that read
// account data; nothing in _app's import graph may import it.
export const db = getFirestore(app);

export const getUserDocRef = (userId: string): DocumentReference => doc(db, "users", userId);
