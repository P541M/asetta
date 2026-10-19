import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { OnboardingUserData } from "../types/onboarding";
import { OnboardingStatus, onboardingStatusFromUserDoc } from "./userDoc";

export async function getUserOnboardingStatus(user: User | null): Promise<OnboardingStatus | null> {
  if (!user) {
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    return onboardingStatusFromUserDoc(userDoc.exists() ? userDoc.data() : undefined);
  } catch (error) {
    console.error("Error fetching user onboarding status:", error);
    // Default to safe state - assume needs onboarding
    return {
      hasCompletedOnboarding: false,
      onboardingCompletedAt: undefined,
      isNewUser: true,
      needsOnboarding: true,
    };
  }
}

export async function loadUserDataForOnboarding(
  user: User | null,
): Promise<{ userData: Partial<OnboardingUserData> } | null> {
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return null;

    const firebaseData = userDoc.data();
    return {
      userData: {
        institution: firebaseData.institution || "",
        emailNotifications: firebaseData.emailNotifications || false,
        hasConsentedToNotifications: firebaseData.hasConsentedToNotifications || false,
        notificationDaysBefore: firebaseData.notificationDaysBefore || 1,
        email: firebaseData.email || "",
      },
    };
  } catch (error) {
    console.error("Error loading user data for onboarding:", error);
    return null;
  }
}
