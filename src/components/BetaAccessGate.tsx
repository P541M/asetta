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
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-indigo-600 dark:text-indigo-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-text-primary">
          Beta Access Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-text-secondary">
          Please enter the beta access code to continue
        </p>
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
                  className="block w-full appearance-none rounded-md border border-gray-300 dark:border-dark-border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400 dark:text-red-400"
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
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
