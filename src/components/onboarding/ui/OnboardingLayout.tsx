import React from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function OnboardingLayout({ children, onSkip, showSkip = true }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Skip Button */}
      {showSkip && onSkip && (
        <header className="flex-shrink-0 border-b border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-end">
              <button
                onClick={onSkip}
                className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-light-button-primary dark:focus:ring-dark-button-primary rounded-md px-4 py-3 sm:px-3 sm:py-1 min-h-[44px] sm:min-h-[auto]"
              >
                Skip setup
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-center text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
            Need help? Contact us at{" "}
            <a
              href="mailto:videna.psalmeleazar@gmail.com"
              className="text-light-button-primary dark:text-dark-button-primary hover:underline"
            >
              videna.psalmeleazar@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
