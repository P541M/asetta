// src/pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { shouldRedirectToOnboarding } from "../utils/onboardingUtils";

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg-primary">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
          Loading...
        </p>
      </div>
    </div>
  );
}
