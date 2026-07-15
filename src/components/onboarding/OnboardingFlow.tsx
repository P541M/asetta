import { CircleAlert } from "lucide-react";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { Alert, AlertDescription } from "../ui/alert";
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
            <Alert variant="destructive" className="mb-6">
              <CircleAlert aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Step content fades on step CHANGE (feedback for Continue/Back), keyed per step */}
          <div key={state.currentStep} className="motion-safe:animate-fade-in">
            {renderCurrentStep()}
          </div>
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
