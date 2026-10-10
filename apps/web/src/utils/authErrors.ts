import { FirebaseError } from "firebase/app";

/** Human-readable messages for the Firebase auth error codes users actually hit. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Please choose a stronger password.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support if this seems wrong.",
  "auth/account-exists-with-different-credential":
    "This email is already linked to a different sign-in method. Try Google or email instead.",
};

/** Deliberate user actions (closing the Google popup) — not errors, show nothing. */
const CANCELLED_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

/**
 * Maps an auth failure to a message users can act on.
 * Returns null when the "failure" was the user cancelling on purpose.
 */
export function getAuthErrorMessage(error: unknown, fallback: string): string | null {
  const code = error instanceof FirebaseError ? error.code : null;
  if (code && CANCELLED_CODES.has(code)) return null;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  return fallback;
}
