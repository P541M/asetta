import Head from 'next/head';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Get Started - Asetta</title>
        <meta name="description" content="Set up your academic planning with AI-powered assessment tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <OnboardingProvider>
        <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
          <OnboardingFlow />
        </div>
      </OnboardingProvider>
    </>
  );
}