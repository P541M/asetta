import { updateProfile, type User } from "firebase/auth";
import { serverTimestamp, updateDoc } from "firebase/firestore";
import { getUserDocRef } from "../lib/firestore";
import type { OnboardingUserData } from "../types/onboarding";
import {
  onboardingChoicesToWrite,
  type DisplayPreferences,
  type NotificationSettings,
  type UserProfile,
} from "../utils/userDoc";

/**
 * What Settings and onboarding write to the user doc. A saved value comes back through useAuth's
 * live doc, which shows a local write at once and reverts one the server refuses. This module
 * imports Firestore, so it stays out of _app's import graph.
 */

/** The display name is Auth's as well as the doc's, so a change goes to both. */
export async function saveProfile(user: User, profile: UserProfile): Promise<void> {
  if (profile.displayName !== (user.displayName || "")) {
    await updateProfile(user, { displayName: profile.displayName });
  }
  await updateDoc(getUserDocRef(user.uid), { ...profile, updatedAt: new Date() });
}

export function saveDisplayPreference(
  uid: string,
  field: keyof DisplayPreferences,
  value: boolean,
): Promise<void> {
  return updateDoc(getUserDocRef(uid), { [field]: value, updatedAt: new Date() });
}

export function saveNotificationSettings(
  uid: string,
  settings: NotificationSettings,
): Promise<void> {
  return updateDoc(getUserDocRef(uid), {
    ...settings,
    // Consent mirrors the notifications toggle (one decision, stored in both fields)
    hasConsentedToNotifications: settings.emailNotifications,
    // The reminder cron looks at this user at its next run, so a change after 9:30 applies today
    nextReminderAt: serverTimestamp(),
    updatedAt: new Date(),
  });
}

export function finishOnboarding(uid: string, userData: OnboardingUserData): Promise<void> {
  return updateDoc(getUserDocRef(uid), {
    hasCompletedOnboarding: true,
    onboardingCompletedAt: new Date(),
    ...onboardingChoicesToWrite(userData),
    // The reminder cron looks at this user at its next run, with the settings chosen here
    nextReminderAt: serverTimestamp(),
  });
}

export function skipOnboarding(uid: string): Promise<void> {
  return updateDoc(getUserDocRef(uid), {
    hasCompletedOnboarding: true,
    onboardingCompletedAt: new Date(),
    onboardingSkipped: true,
  });
}
