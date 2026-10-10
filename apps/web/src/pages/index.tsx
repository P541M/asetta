// src/pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { shouldRedirectToOnboarding } from "../utils/onboardingUtils";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function Index() {
  const router = useRouter();
  const { user, loading, onboardingStatus, onboardingLoading } = useAuth();

  useEffect(() => {
    // Wait for both auth and onboarding status to load
    if (!loading && !onboardingLoading) {
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
  }, [user, loading, onboardingStatus, onboardingLoading, router]);

  // Show loading state while checking auth and onboarding status
  return <LoadingScreen />;
}
