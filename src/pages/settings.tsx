import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import UserSettings from "../components/settings/UserSettings";
import { useEffect } from "react";
import Head from "next/head";
import DashboardHeader from "../components/layout/DashboardHeader";

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-secondary dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
          <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-safe-screen bg-light-bg-secondary dark:bg-dark-bg-primary transition-theme">
      <Head>
        <title>Settings - Asetta</title>
        <meta
          name="description"
          content="Manage your account settings and preferences"
        />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-light-button-primary dark:text-dark-button-primary mb-7">
              Settings
            </h1>

            {/* Back Navigation */}
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span className="text-sm">Back to Dashboard</span>
              </button>
            </div>
          </div>

          <UserSettings isOpen={true} onClose={() => router.back()} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
