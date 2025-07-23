import React from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';

interface StepNavigationProps {
  canGoNext?: boolean;
  canGoBack?: boolean;
  nextLabel?: string;
  backLabel?: string;
  showSkip?: boolean;
  skipLabel?: string;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

export function StepNavigation({
  canGoNext = true,
  canGoBack = true,
  nextLabel = 'Continue',
  backLabel = 'Back',
  showSkip = false,
  skipLabel = 'Skip',
  onNext,
  onBack,
  onSkip,
  isLoading = false,
}: StepNavigationProps) {
  const { state, nextStep, prevStep } = useOnboarding();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      prevStep();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-light-border-primary dark:border-dark-border-primary">
      {/* Back Button */}
      <div>
        {state.currentStep > 1 && canGoBack && (
          <button
            onClick={handleBack}
            disabled={isLoading}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{backLabel}</span>
          </button>
        )}
      </div>

      {/* Skip Button (centered) */}
      <div>
        {showSkip && (
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {skipLabel}
          </button>
        )}
      </div>

      {/* Next Button */}
      <div>
        <button
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>{nextLabel}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}