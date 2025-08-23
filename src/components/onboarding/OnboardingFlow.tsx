import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingLayout } from './ui/OnboardingLayout';
import { ProgressBar } from './ui/ProgressBar';
import { WelcomeStep } from './steps/WelcomeStep';
import { ProfileStep } from './steps/ProfileStep';
import { SemesterStep } from './steps/SemesterStep';
import { UploadStep } from './steps/UploadStep';
import { NotificationsStep } from './steps/NotificationsStep';
import { CompletionStep } from './steps/CompletionStep';
import ConfirmationModal from '../common/ConfirmationModal';

export function OnboardingFlow() {
  const { state, requestExit, cancelExit, confirmExit } = useOnboarding();

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
        return <NotificationsStep />;
      case 6:
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <>
      <OnboardingLayout onSkip={requestExit} showSkip={true}>
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

      {/* Exit Confirmation Modal */}
      <ConfirmationModal
        isOpen={state.showExitModal}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="Skip Onboarding?"
        message={
          <>
            <p>Are you sure you want to skip the setup process?</p>
            <p className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              You can complete your profile and add semesters later from your dashboard.
            </p>
          </>
        }
        confirmText="Skip"
        cancelText="Continue Setup"
        variant="warning"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />
    </>
  );
}