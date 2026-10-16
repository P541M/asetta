import type { DocumentData } from "firebase/firestore";
import { storedDate } from "./dateUtils";

/** Reads of the user doc (`users/{uid}`) and the rules for what sign-in writes to it. */

export interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: Date;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

export interface DisplayPreferences {
  showDaysTillDue: boolean;
  showWeight: boolean;
  showNotes: boolean;
  showStatsBar: boolean;
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  showDaysTillDue: true,
  showWeight: true,
  showNotes: true,
  showStatsBar: false,
};

/** Why the signed-in user's doc couldn't be loaded: no connection, or anything else. */
export type UserDocError = "offline" | "failed";

/** Sorts a Firestore error: `unavailable` is the client being offline. */
export function userDocErrorKind(error: unknown): UserDocError {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : null;
  return code === "unavailable" ? "offline" : "failed";
}

/** Onboarding status from the user doc's data; `undefined` is a doc that doesn't exist yet. */
export function onboardingStatusFromUserDoc(data: DocumentData | undefined): OnboardingStatus {
  if (!data) {
    return {
      hasCompletedOnboarding: false,
      onboardingCompletedAt: undefined,
      isNewUser: true,
      needsOnboarding: true,
    };
  }

  const hasCompletedOnboarding = data.hasCompletedOnboarding ?? false;
  const onboardingCompletedAt = data.onboardingCompletedAt?.toDate();

  // Consider a user "new" if they don't have onboarding completion data
  const isNewUser = !hasCompletedOnboarding && !onboardingCompletedAt;

  return {
    hasCompletedOnboarding,
    onboardingCompletedAt,
    isNewUser,
    needsOnboarding: !hasCompletedOnboarding,
  };
}

export function shouldRedirectToOnboarding(onboardingStatus: OnboardingStatus | null): boolean {
  if (!onboardingStatus) {
    return false;
  }

  return onboardingStatus.needsOnboarding;
}

/** Display preferences from the user doc's data, defaulting each one that isn't set. */
export function displayPreferencesFromUserDoc(data: DocumentData | undefined): DisplayPreferences {
  if (!data) return DEFAULT_DISPLAY_PREFERENCES;
  return {
    showDaysTillDue: data.showDaysTillDue ?? true,
    showWeight: data.showWeight ?? true,
    showNotes: data.showNotes ?? true,
    showStatsBar: data.showStatsBar ?? false,
  };
}

/** What the app shows of the account: the name in the greeting and the avatar. */
export interface UserProfile {
  displayName: string;
}

export function profileFromUserDoc(data: DocumentData | undefined): UserProfile {
  return { displayName: data?.displayName || "" };
}

/**
 * The notification address the student confirmed through its link (A17). Only the server writes
 * it; reminders go to the chosen address once it matches this one (utils/notificationEmail.ts).
 */
export function verifiedEmailFromUserDoc(data: DocumentData | undefined): string | null {
  return typeof data?.verifiedEmail === "string" ? data.verifiedEmail : null;
}

const localDay = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/**
 * The `lastLogin` a sign-in writes to an existing user doc, or null when it writes none: at most
 * once per local calendar day (A12), so most page loads write nothing.
 */
export function lastLoginToWrite(stored: unknown, now: Date): Date | null {
  const last = storedDate(stored);
  const sameDay =
    last !== null && !Number.isNaN(last.getTime()) && localDay(last) === localDay(now);
  return sameDay ? null : now;
}

/**
 * The browser's zone when sign-in should save it on an existing user doc (missing or changed),
 * else null. Saving it also sets `nextReminderAt`, so the reminder cron reschedules (A8).
 */
export function timeZoneToWrite(stored: unknown, browserZone: string | null): string | null {
  return browserZone && browserZone !== stored ? browserZone : null;
}
