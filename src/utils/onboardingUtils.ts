import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    const userDocRef = doc(db, 'users', user.uid);
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
    console.error('Error fetching user onboarding status:', error);
    // Default to safe state - assume needs onboarding
    return {
      hasCompletedOnboarding: false,
      onboardingCompletedAt: undefined,
      isNewUser: true,
      needsOnboarding: true,
    };
  }
}

export function saveOnboardingProgress(stepData: Record<string, unknown>) {
  try {
    localStorage.setItem('onboarding-progress', JSON.stringify({
      ...stepData,
      lastSaved: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
  }
}

export function getOnboardingProgress(): Record<string, unknown> | null {
  try {
    const saved = localStorage.getItem('onboarding-progress');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error retrieving onboarding progress:', error);
    return null;
  }
}

export function clearOnboardingProgress() {
  try {
    localStorage.removeItem('onboarding-progress');
  } catch (error) {
    console.error('Error clearing onboarding progress:', error);
  }
}

export function shouldRedirectToOnboarding(onboardingStatus: OnboardingStatus | null): boolean {
  if (!onboardingStatus) {
    return false;
  }

  return onboardingStatus.needsOnboarding;
}