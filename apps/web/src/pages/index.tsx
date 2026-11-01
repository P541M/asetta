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
        router.push("/login");
      } else if (shouldRedirectToOnboarding(onboardingStatus)) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, onboardingStatus, router]);

  return <LoadingScreen />;
}
