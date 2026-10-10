import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Step indicators */}
      <div className="mb-2 flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="size-4" aria-hidden /> : stepNumber}
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="mb-4 h-2 w-full rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress text */}
      <p className="text-center text-xs font-medium text-muted-foreground">
        Step {currentStep} of {totalSteps} ({Math.round(progress)}% complete)
      </p>
    </div>
  );
}
