import React from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
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
