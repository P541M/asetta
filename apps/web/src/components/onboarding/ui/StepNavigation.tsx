import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { Button } from "../../ui/button";

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
  nextLabel = "Continue",
  backLabel = "Back",
  showSkip = false,
  skipLabel = "Skip",
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
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      {/* Back button */}
      <div>
        {state.currentStep > 1 && canGoBack && (
          <Button type="button" variant="secondary" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft aria-hidden />
            {backLabel}
          </Button>
        )}
      </div>

      {/* Skip button (centered) */}
      <div>
        {showSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            {skipLabel}
          </Button>
        )}
      </div>

      {/* Next button */}
      <div>
        <Button type="button" onClick={handleNext} disabled={!canGoNext || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="motion-safe:animate-spin" aria-hidden />
              Processing...
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
