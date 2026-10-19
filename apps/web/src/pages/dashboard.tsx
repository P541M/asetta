import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { shouldRedirectToOnboarding } from "../utils/userDoc";
import LoadingScreen from "../components/ui/LoadingScreen";

const Dashboard = () => {
  const { user, loading, onboardingStatus } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const redirectToFirstSemester = async () => {
      // Wait for auth and the user doc (onboarding status) to load
      if (loading) {
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user needs to complete onboarding first
      if (shouldRedirectToOnboarding(onboardingStatus)) {
        router.push("/onboarding");
        return;
      }

      if (!redirecting) {
        setRedirecting(true);
        try {
          // Loaded here, not with the page: the user doc's listener has loaded Firestore by now,
          // and a signed-out visitor never needs it (A15)
          const { firstSemesterId } = await import("../hooks/firstSemester");
          const semesterId = await firstSemesterId(user.uid);

          if (semesterId) {
            router.push(`/dashboard/${semesterId}/assessments`);
          } else {
            // No semesters found, redirect to assessments page to create one
            router.push("/dashboard/assessments");
          }
        } catch (error) {
          console.error("Error fetching first semester:", error);
          // Fallback to assessments page
          router.push("/dashboard/assessments");
        }
      }
    };

    redirectToFirstSemester();
  }, [user, loading, onboardingStatus, router, redirecting]);

  if (loading) {
    return <LoadingScreen />;
  }

  return null;
};

export default Dashboard;
