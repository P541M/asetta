import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './ui/OnboardingLayout';
import { ProgressBar } from './ui/ProgressBar';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { SemesterStep } from './steps/SemesterStep';
import { UploadStep } from './steps/UploadStep';
import { CompletionStep } from './steps/CompletionStep';

export function OnboardingFlow() {
  const { state } = useOnboarding();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <ProfileStep />;
      case 3:
        return <SemesterStep />;
      case 4:
        return <UploadStep />;
      case 5:
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <OnboardingLayout>
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            currentStep={state.currentStep} 
            totalSteps={state.totalSteps}
          />
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="mb-6 p-4 bg-light-error-bg dark:bg-dark-error-bg border border-light-error-border dark:border-dark-error-border rounded-lg animate-fade-in">
            <p className="text-light-error-text dark:text-dark-error-text text-sm">
              {state.error}
            </p>
          </div>
        )}

        {/* Current Step Content */}
        <div className="animate-fade-in-up">
          {renderCurrentStep()}
        </div>
      </div>
    </OnboardingLayout>
  );
}