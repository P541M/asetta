// src/pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { shouldRedirectToOnboarding } from "../utils/userDoc";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function Index() {
  const router = useRouter();
  const { user, loading, onboardingStatus } = useAuth();

  useEffect(() => {
    // Wait for auth and the user doc (onboarding status) to load
    if (!loading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push("/login");
      } else if (shouldRedirectToOnboarding(onboardingStatus)) {
        // Authenticated but needs onboarding - redirect to onboarding
        router.push("/onboarding");
      } else {
        // Authenticated and completed onboarding - redirect to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, loading, onboardingStatus, router]);

  // Show loading state while checking auth and onboarding status
  return <LoadingScreen />;
}
