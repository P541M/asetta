import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";
import type { UserDocError } from "../utils/userDoc";

interface UserDocState {
  uid: string;
  data: DocumentData | undefined;
  error: UserDocError | null;
}

/**
 * The signed-in user's doc, live: one listener per sign-in, shared through AuthContext, so a
 * dashboard load reads the doc once (A12). The server's first answer runs the sign-in writes
 * (hooks/userDocListener.ts).
 *
 * This hook is in every page's bundle (_app), so it imports no Firestore code: the listener loads
 * with `import()` once someone is signed in, and a signed-out visitor never downloads Firestore
 * (A15). A listener that can't load is an error state, like a read that fails.
 */
export function useUserDoc(user: User | null) {
  const [state, setState] = useState<UserDocState | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const load = () =>
      import("./userDocListener")
        .then(({ listenToUserDoc }) => {
          if (cancelled) return;
          unsubscribe = listenToUserDoc(user, (update) => setState({ uid, ...update }));
        })
        .catch((error) => {
          console.error("Could not load the user doc listener:", error);
          if (cancelled) return;
          setState({ uid, data: undefined, error: navigator.onLine ? "failed" : "offline" });
          // Offline is the usual reason: try again once the connection is back, as the listener
          // itself recovers. Otherwise the error screen's "Try again" (a reload) fetches it again.
          window.addEventListener("online", load, { once: true });
        });
    load();

    return () => {
      cancelled = true;
      window.removeEventListener("online", load);
      unsubscribe?.();
    };
  }, [user]);

  // State loaded for another account (or none) doesn't count: that's still loading
  const current = user && state?.uid === user.uid ? state : null;
  return useMemo(
    () => ({
      data: current?.data,
      loading: user !== null && current === null,
      error: current?.error ?? null,
    }),
    [user, current],
  );
}
