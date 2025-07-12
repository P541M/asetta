import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import UserSettings from "../components/settings/UserSettings";
import { useEffect } from "react";

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg-primary">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-light-button-primary border-t-transparent dark:border-dark-button-primary dark:border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
      <div className="max-w-4xl mx-auto">
        <UserSettings isOpen={true} onClose={() => router.back()} />
      </div>
    </div>
  );
};

export default SettingsPage;
