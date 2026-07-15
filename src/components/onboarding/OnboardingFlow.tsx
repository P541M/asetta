import { useOnboarding } from "../../contexts/OnboardingContext";
import { OnboardingLayout } from "./ui/OnboardingLayout";
import { ProgressBar } from "./ui/ProgressBar";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { SemesterStep } from "./steps/SemesterStep";
import { UploadStep } from "./steps/UploadStep";
import { NotificationsStep } from "./steps/NotificationsStep";
import { CompletionStep } from "./steps/CompletionStep";
import ConfirmationModal from "../common/ConfirmationModal";

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
            <ProgressBar currentStep={state.currentStep} totalSteps={state.totalSteps} />
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
          <div className="animate-fade-in-up">{renderCurrentStep()}</div>
        </div>
      </OnboardingLayout>

      {/* Exit Confirmation Modal */}
      <ConfirmationModal
        isOpen={state.showExitModal}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="Skip onboarding?"
        message={
          <>
            <p>Are you sure you want to skip the setup process?</p>
            <p className="mt-2">
              You can complete your profile and add semesters later from your dashboard.
            </p>
          </>
        }
        confirmText="Skip"
        cancelText="Continue setup"
      />
    </>
  );
}
