import { NextRouter } from "next/router";
import { User } from "firebase/auth";
import { shouldRedirectToOnboarding } from "./userDoc";

/** After sign-in/sign-up: send new users to onboarding, everyone else to the dashboard. */
export async function redirectAfterAuth(user: User, router: NextRouter): Promise<void> {
  try {
    // Loaded when it runs, so the sign-in pages don't ship Firestore (A15)
    const { getUserOnboardingStatus } = await import("./onboardingUtils");
    const onboardingStatus = await getUserOnboardingStatus(user);
    if (shouldRedirectToOnboarding(onboardingStatus)) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Default to dashboard if there's an error
    router.push("/dashboard");
  }
}
