
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className = '' }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={`w-full ${className}`}>
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                isCompleted
                  ? 'bg-light-button-primary dark:bg-dark-button-primary text-white'
                  : isCurrent
                  ? 'bg-light-button-primary/10 dark:bg-dark-button-primary/10 text-light-button-primary dark:text-dark-button-primary border-2 border-light-button-primary dark:border-dark-button-primary'
                  : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-tertiary dark:text-dark-text-tertiary'
              }`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-2 mb-4">
        <div
          className="bg-light-button-primary dark:bg-dark-button-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="text-center">
        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary ml-2">
          ({Math.round(progress)}% complete)
        </span>
      </div>
    </div>
  );
}