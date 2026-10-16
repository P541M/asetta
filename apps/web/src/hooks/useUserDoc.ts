import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import {
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getUserDocRef } from "../lib/firebaseUtils";
import { devError } from "../utils/devLog";
import { browserTimeZone } from "../utils/timeZone";
import {
  lastLoginToWrite,
  timeZoneToWrite,
  UserDocError,
  userDocErrorKind,
} from "../utils/userDoc";

/** Asks the server for the welcome email. It goes to the account's own address, at most once. */
async function requestWelcomeEmail(user: User, displayName: string) {
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ displayName }),
    });
    if (!response.ok) {
      devError("Welcome email request failed");
    }
  } catch {
    devError("Welcome email request error");
  }
}

/**
 * The sign-in writes, from the server's first answer: a missing doc is created (and requests
 * the welcome email); an existing one gets `lastLogin` at most once a day (A12) and the browser's
 * zone when it is missing or has changed.
 */
async function bootstrapUserDoc(user: User, snapshot: DocumentSnapshot): Promise<void> {
  const now = new Date();
  // Reminders go out at 9:30 in this zone (A8). nextReminderAt set to the server's now asks
  // the reminder cron to look at this user at its next run, which then schedules the next 9:30.
  const timeZone = browserTimeZone();

  if (!snapshot.exists()) {
    // firestore.rules caps displayName at 200 characters; a longer Auth name would fail the create
    const displayName = (user.displayName || user.email?.split("@")[0] || "User").slice(0, 200);
    await setDoc(snapshot.ref, {
      displayName,
      email: user.email || "",
      institution: "",
      createdAt: now,
      lastLogin: now,
      ...(timeZone ? { timeZone } : {}),
      nextReminderAt: serverTimestamp(),
    });
    // Every new user doc (email and Google sign-ups alike) requests the welcome email.
    // Not awaited: sign-in shouldn't wait on the mail server.
    void requestWelcomeEmail(user, displayName);
    return;
  }

  const stored = snapshot.data();
  const lastLogin = lastLoginToWrite(stored.lastLogin, now);
  const zone = timeZoneToWrite(stored.timeZone, timeZone);
  if (!lastLogin && !zone) return;
  await setDoc(
    snapshot.ref,
    {
      ...(lastLogin ? { lastLogin } : {}),
      ...(zone ? { timeZone: zone, nextReminderAt: serverTimestamp() } : {}),
    },
    { merge: true },
  );
}

interface UserDocState {
  uid: string;
  data: DocumentData | undefined;
  error: UserDocError | null;
}

/**
 * The signed-in user's doc, live: one listener per sign-in, shared through AuthContext, so a
 * dashboard load reads the doc once (A12). The server's first answer runs the sign-in writes.
 *
 * Only the server can say the doc is missing: offline with nothing cached is "offline", never a
 * missing doc (which would create a new one over the real one). The listener keeps waiting and
 * the error clears once the server answers.
 */
export function useUserDoc(user: User | null) {
  const [state, setState] = useState<UserDocState | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let bootstrapped = false;
    let createFailed = false;

    // Metadata changes too, so the server confirming what the cache showed still counts as its
    // first answer
    return onSnapshot(
      getUserDocRef(uid),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (createFailed) return;
        const fromServer = !snapshot.metadata.fromCache;
        if (!fromServer && !snapshot.exists()) {
          setState({ uid, data: undefined, error: "offline" });
          return;
        }
        setState({ uid, data: snapshot.data(), error: null });

        if (bootstrapped || !fromServer) return;
        bootstrapped = true;
        bootstrapUserDoc(user, snapshot).catch((error) => {
          console.error("Could not save the sign-in to the user doc:", error);
          // Without its doc the account can't work; a skipped lastLogin or zone write can wait
          if (!snapshot.exists()) {
            createFailed = true;
            setState({ uid, data: undefined, error: userDocErrorKind(error) });
          }
        });
      },
      (error) => {
        console.error("Could not load the user doc:", error);
        setState({ uid, data: undefined, error: userDocErrorKind(error) });
      },
    );
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
