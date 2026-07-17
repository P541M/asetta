import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OnboardingUserData } from "../types/onboarding";

export interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: Date;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

export async function getUserOnboardingStatus(user: User | null): Promise<OnboardingStatus | null> {
  if (!user) {
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        hasCompletedOnboarding: false,
        onboardingCompletedAt: undefined,
        isNewUser: true,
        needsOnboarding: true,
      };
    }

    const userData = userDoc.data();
    const hasCompletedOnboarding = userData.hasCompletedOnboarding ?? false;
    const onboardingCompletedAt = userData.onboardingCompletedAt?.toDate();

    // Consider a user "new" if they don't have onboarding completion data
    const isNewUser = !hasCompletedOnboarding && !onboardingCompletedAt;

    return {
      hasCompletedOnboarding,
      onboardingCompletedAt,
      isNewUser,
      needsOnboarding: !hasCompletedOnboarding,
    };
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

export function shouldRedirectToOnboarding(onboardingStatus: OnboardingStatus | null): boolean {
  if (!onboardingStatus) {
    return false;
  }

  return onboardingStatus.needsOnboarding;
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
