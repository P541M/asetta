import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import UserSettings from "../components/settings/UserSettings";

const SettingsPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
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
