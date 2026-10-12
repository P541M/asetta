import Head from "next/head";
import { useAuth } from "../contexts/AuthContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";
import LoadErrorScreen from "../components/ui/LoadErrorScreen";

export default function OnboardingPage() {
  const { user, userDocError } = useAuth();

  // Never onboarding over a user doc that couldn't be read: finishing would overwrite it
  if (user && userDocError) {
    return <LoadErrorScreen error={userDocError} />;
  }

  return (
    <>
      <Head>
        <title>Get Started - Asetta</title>
        <meta
          name="description"
          content="Set up your academic planning with AI-powered assessment tracking"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <OnboardingProvider>
        <div className="min-h-screen bg-background">
          <OnboardingFlow />
        </div>
      </OnboardingProvider>
    </>
  );
}
