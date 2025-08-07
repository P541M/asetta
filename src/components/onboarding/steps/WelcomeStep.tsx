import { StepNavigation } from "../ui/StepNavigation";
import { useAuth } from "../../../contexts/AuthContext";

export function WelcomeStep() {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split("@")[0] || "there";

  return (
    <div className="text-center">
      <div className="mb-12">
        <div className="w-16 h-16 bg-light-button-primary dark:bg-dark-button-primary rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
          Welcome to Asetta, {userName}!
        </h1>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary max-w-lg mx-auto">
          Upload your course outlines and we&apos;ll automatically track all your assessments and deadlines.
        </p>
      </div>

      <StepNavigation canGoBack={false} nextLabel="Get Started" />
    </div>
  );
}
