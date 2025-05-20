import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface BetaAccessGateProps {
  children: React.ReactNode;
}

const BetaAccessGate: React.FC<BetaAccessGateProps> = ({ children }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  // Check if user already has beta access
  useEffect(() => {
    const betaAccess = localStorage.getItem("beta_access");
    if (betaAccess === "granted") {
      setHasAccess(true);
    }
  }, []);

  // Exclude certain paths from beta gate
  const isExcludedPath = () => {
    const excludedPaths = [
      "/login",
      "/register",
      "/reset-password",
      "/terms",
      "/privacy",
    ];
    return excludedPaths.includes(router.pathname);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const BETA_PASSCODE = process.env.NEXT_PUBLIC_BETA_PASSCODE;

    if (!BETA_PASSCODE) {
      setError("Beta access is not properly configured.");
      return;
    }

    if (passcode === BETA_PASSCODE) {
      localStorage.setItem("beta_access", "granted");
      setHasAccess(true);
      setError("");
    } else {
      setError("Invalid passcode. Please try again.");
    }
  };

  if (isExcludedPath() || hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary">
            Welcome to Kivo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-dark-text-secondary">
            Please enter your beta access code to continue
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-bg-secondary py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="passcode"
                className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary"
              >
                Beta Access Code
              </label>
              <div className="mt-1">
                <input
                  id="passcode"
                  name="passcode"
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-input-border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-dark-input-bg dark:text-dark-input-text dark:placeholder-dark-input-placeholder"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-dark-error-bg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400 dark:text-dark-error-text"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-dark-error-text">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-dark-button-primary dark:hover:bg-dark-button-primary-hover dark:focus:ring-dark-focus-ring"
              >
                Enter Beta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BetaAccessGate;
