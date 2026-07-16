import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserSettings from "../components/settings/UserSettings";
import { useEffect } from "react";
import Head from "next/head";
import DashboardHeader from "../components/layout/DashboardHeader";
import LoadingScreen from "../components/ui/LoadingScreen";
import { Button } from "../components/ui/button";

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
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-safe-screen bg-background">
      <Head>
        <title>Settings - Asetta</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Head>
      <DashboardHeader onLogout={handleLogout} />
      <div className="p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe">
        <div className="mx-auto max-w-7xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Settings
            </h1>

            {/* Back navigation */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              <ArrowLeft aria-hidden />
              Back to dashboard
            </Button>
          </div>

          <UserSettings isOpen={true} onClose={() => router.back()} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
