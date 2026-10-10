import React from "react";
import { Button } from "../../ui/button";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function OnboardingLayout({ children, onSkip, showSkip = true }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with skip button */}
      {showSkip && onSkip && (
        <header className="shrink-0">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="text-muted-foreground"
              >
                Skip setup
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>

      {/* Footer */}
      <footer className="shrink-0">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-center text-xs font-medium text-muted-foreground">
            Need help? Contact us at{" "}
            <a href="mailto:videna.psalmeleazar@gmail.com" className="text-primary hover:underline">
              videna.psalmeleazar@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
