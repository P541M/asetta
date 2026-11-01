import { useEffect } from "react";
import dynamic, { type DynamicOptionsLoadingProps } from "next/dynamic";
import { CircleAlert } from "lucide-react";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { Alert, AlertDescription } from "../ui/alert";
import ChunkLoading from "../ui/ChunkLoading";
import { OnboardingLayout } from "./ui/OnboardingLayout";
import { ProgressBar } from "./ui/ProgressBar";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { SemesterStep } from "./steps/SemesterStep";
import { NotificationsStep } from "./steps/NotificationsStep";
import { CompletionStep } from "./steps/CompletionStep";
import ConfirmationModal from "../common/ConfirmationModal";

/* The upload step is its own chunk (the upload form and the course color picker), so the page
   loads without it. It is fetched when onboarding opens, so it is there by the time the student
   reaches it. */
const loadUploadStep = () => import("./steps/UploadStep").then((step) => step.UploadStep);

const StepLoading = (props: DynamicOptionsLoadingProps) => <ChunkLoading {...props} part="step" />;

const UploadStep = dynamic(loadUploadStep, { ssr: false, loading: StepLoading });

export function OnboardingFlow() {
  const { state, requestExit, cancelExit, confirmExit } = useOnboarding();

  useEffect(() => {
    // A failed fetch is retried, and shown, by the step's own load
    loadUploadStep().catch(() => {});
  }, []);

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
          <div className="mb-8">
            <ProgressBar currentStep={state.currentStep} totalSteps={state.totalSteps} />
          </div>

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
