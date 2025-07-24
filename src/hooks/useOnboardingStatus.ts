import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { getUserOnboardingStatus, OnboardingStatus } from '@/utils/onboardingUtils';

interface UseOnboardingStatusReturn {
  onboardingStatus: OnboardingStatus | null;
  loading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

export function useOnboardingStatus(user: User | null): UseOnboardingStatusReturn {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setOnboardingStatus(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const status = await getUserOnboardingStatus(user);
      setOnboardingStatus(status);
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      setError('Failed to fetch onboarding status');
      // Set safe default
      setOnboardingStatus({
        hasCompletedOnboarding: false,
        onboardingCompletedAt: undefined,
        isNewUser: true,
        needsOnboarding: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshStatus = async () => {
    await fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.uid, fetchStatus]); // Include fetchStatus in dependencies

  return {
    onboardingStatus,
    loading,
    error,
    refreshStatus,
  };
}