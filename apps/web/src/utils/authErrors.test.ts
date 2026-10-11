import { FirebaseError } from "firebase/app";
import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./authErrors";

const FALLBACK = "Something went wrong. Please try again.";
const authError = (code: string) => new FirebaseError(code, `Firebase: Error (${code}).`);

describe("getAuthErrorMessage", () => {
  it.each([
    ["auth/invalid-credential", "Incorrect email or password."],
    ["auth/wrong-password", "Incorrect email or password."],
    ["auth/user-not-found", "No account found with this email address."],
    [
      "auth/email-already-in-use",
      "An account with this email already exists. Try signing in instead.",
    ],
    ["auth/too-many-requests", "Too many attempts. Please wait a few minutes and try again."],
    ["auth/network-request-failed", "Network error. Check your connection and try again."],
  ])("explains %s", (code, message) => {
    expect(getAuthErrorMessage(authError(code), FALLBACK)).toBe(message);
  });

  it.each(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"])(
    "shows nothing when the user cancelled (%s)",
    (code) => {
      expect(getAuthErrorMessage(authError(code), FALLBACK)).toBeNull();
    },
  );

  it("uses the fallback for a code it doesn't know", () => {
    expect(getAuthErrorMessage(authError("auth/internal-error"), FALLBACK)).toBe(FALLBACK);
  });

  it("uses the fallback for anything that isn't a FirebaseError", () => {
    expect(getAuthErrorMessage(new Error("auth/invalid-credential"), FALLBACK)).toBe(FALLBACK);
    expect(getAuthErrorMessage({ code: "auth/invalid-credential" }, FALLBACK)).toBe(FALLBACK);
    expect(getAuthErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
